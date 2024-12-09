// https://raw.githubusercontent.com/ozum/vuepress-bar/master/lib/index.js
import sortBy from 'lodash.sortby';
import { fileURLToPath } from 'url';
import { sync } from 'glob';
import markdownIt from 'markdown-it';
import meta from 'markdown-it-meta';
import title from 'markdown-it-title';
import { lstatSync, readdirSync, readFileSync, existsSync } from 'fs';
import { join, normalize, sep, dirname, basename } from 'path';
import escapeRegExp from 'lodash.escaperegexp';
import { slugify } from 'transliteration';
import { titleize } from 'inflection';
import parentModule from 'parent-module';
import { DefaultTheme } from 'vitepress';

const ignoreList = ['node_modules', '.git', '.vitepress', 'public'];
interface MarkdownItMeta {
  order?: number;
  sidebar?: boolean;
  // add other properties if needed
}

const isDirectory = (source) => lstatSync(source).isDirectory();
const getDirectories = (source) =>
  readdirSync(source).filter(
    (name) => !ignoreList.includes(name) && isDirectory(join(source, name))
  );
const hasIndex = (source) =>
  readdirSync(source).findIndex(
    (name) => name.toLowerCase() === 'index.md' && !isDirectory(join(source, name))
  ) > -1;

/**
 * Translate chinese to pinyin.
 * Compatible with vuepress-pluin-permalink-pinyin.
 * @param {Array} navArr
 */
function transliteratePinyin(navArr: Array<any>) {
  return navArr.map((nav) => {
    const result = { ...nav };
    if (nav.link) {
      result.link = slugify(nav.link, { ignore: ['/', '.'] });
    }
    if (nav.items) {
      result.items = transliteratePinyin(nav.items);
    }
    return result;
  });
}

/**
 * https://github.com/ozum/vuepress-bar/issues/55
 */
function transliteratePinyinSiderbar(
  sidebar: DefaultTheme.Sidebar
): DefaultTheme.Sidebar {
  if (Array.isArray(sidebar)) {
    // array
    return sidebar.map((item) => {
      if (item.items) {
        item.items = _transliteratePinyinSiderbar(item.items);
        return item;
      }

      return {
        ...item,
        link: item.link ? slugify(item.link, { ignore: ['/', '.'] }) : item.link,
      };
    });
  } else {
    // object
    for (let path in sidebar) {
      let newPath = slugify(path, { ignore: ['/', '.'] });
      const v = sidebar[path];
      if (Array.isArray(v)) {
        sidebar[newPath] = _transliteratePinyinSiderbar(v);
      } else {
        // Not sure about this..
        sidebar[newPath] = v;
      }
      delete sidebar[path];
    }
    return sidebar;
  }
}
function _transliteratePinyinSiderbar(
  sidebar: DefaultTheme.SidebarItem[]
): DefaultTheme.SidebarItem[] {
  return sidebar.map((item) => {
    if (item.items) {
      item.items = _transliteratePinyinSiderbar(item.items);
      return item;
    }

    return {
      ...item,
      link: item.link ? slugify(item.link, { ignore: ['/', '.'] }) : item.link,
    };
  });
}

/**
 * Returns name to be used in menus after removing navigation prefix, prefix numbers used for ordering and `.`, `-`, `_` and spaces.
 *
 * @param   {string}  path                  - File path to get name for.
 * @param   {Object}  options               - Options
 * @param   {string}  options.navPrefix     - Navigation order prefix if present.
 * @param   {boolean} options.stripNumbers  - Whether to strip numbers.
 * @returns {string}                        - Name to be used in navigation.
 * @example
 * getName("/some/path/nav-01-how", { navPrefix: "nav", stripNumbers: true }); // how
 * getName("/some/path/nav.01.how", { navPrefix: "nav", stripNumbers: true }); // how
 */
function getName(
  path: string,
  { navPrefix, stripNumbers }: { navPrefix?: string; stripNumbers?: boolean } = {}
): string {
  let name = path.split(sep).pop() ?? '';
  const argsIndex = name.lastIndexOf('--') ?? -1;
  if (argsIndex > -1) {
    name = name.substring(0, argsIndex);
  }

  if (navPrefix) {
    // "nav.001.xyz" or "nav-001.xyz" or "nav_001.xyz" or "nav 001.xyz" -> "nav"
    const pattern = new RegExp(`^${escapeRegExp(navPrefix)}[.\-_ ]?`);
    name = name.replace(pattern, '');
  }
  if (stripNumbers) {
    // "001.guide" or "001-guide" or "001_guide" or "001 guide" -> "guide"
    name = name.replace(/^\d+[.\-_ ]?/, '');
  }

  return titleize(name.replace('-', ' '));
}

interface FileGlobResult {
  path: string;
  order: number;
  title: string;
}
// Load all MD files in a specified directory and order by metadata 'order' value
function getChildren(
  parent_path,
  dir,
  filter,
  recursive = true,
  { navPrefix, stripNumbers }: { navPrefix?: string; stripNumbers?: boolean } = {}
): DefaultTheme.SidebarItem[] {
  // CREDITS: https://github.com/benjivm (from: https://github.com/vuejs/vuepress/issues/613#issuecomment-495751473)
  parent_path = normalize(parent_path);
  parent_path = parent_path.endsWith(sep) ? parent_path.slice(0, -1) : parent_path; // Remove last / if exists.
  const pattern = recursive ? '/**/*.md' : '/*.md';
  const files = sync(parent_path + (dir ? `/${dir}` : '') + pattern)
    .map((path): FileGlobResult | undefined => {
      // Instantiate MarkdownIt
      const md = new markdownIt();
      // Add markdown-it-meta
      md.use(meta);
      // Add markdown-it-title
      md.use(title);
      // Get the order value
      const file = readFileSync(path, 'utf8');
      const env: any = {};
      md.render(file, env);

      // If available use filter option to filter based omn Front Matter meta data.
      if (filter && !filter((md as any).meta)) return undefined;

      const order = (md as any).meta.order;
      // Remove "parent_path" and ".md"
      path = path.slice(parent_path.length + 1, -3);
      // Remove "index", making it the de facto index page
      if (basename(path.toLowerCase()) === 'index') {
        // if (path.toLowerCase().endsWith("index")) {
        path = path.slice(0, -6) + '/';
      }

      // console.log('md', Object.keys(md));
      return {
        path,
        order: path === '' && order === undefined ? 0 : order, // index is first if it hasn't order
        title: (md as any).meta.title ?? env.title,
      };
    })
    .filter((obj) => obj !== undefined);

  // Return the ordered list of files, sort by 'order' then 'path'
  return (
    sortBy(files, ['order', 'path'])
      // .map(file => file?.path)
      .filter((file): file is FileGlobResult => file !== undefined)
      .map((file) => {
        return {
          text: file?.title ?? getName(file?.path, { stripNumbers, navPrefix }),
          link: '/' + file?.path,
        };
      })
  );
}

// interface FileLinkObject {
//   title: string;
//   children?: FileLink[];
// }
// type FileLink = string | FileLinkObject;
/**
 * Return sidebar config for given baseDir.
 *
 * @param   {String} baseDir        - Absolute path of directory to get sidebar config for.
 * @param   {Object} options        - Options
 * @param   {String} relativeDir    - Relative directory to add to baseDir
 * @param   {Number} currentLevel   - Current level of items.
 * @returns {Array.<String|Object>} - Recursion level
 */
function side(
  baseDir: string,
  {
    stripNumbers,
    maxLevel,
    navPrefix,
    skipEmptySidebar,
    addReadMeToFirstGroup,
    mixDirectoriesAndFilesAlphabetically,
    filter,
  }: {
    stripNumbers: boolean;
    maxLevel: number;
    navPrefix: string;
    skipEmptySidebar: boolean;
    addReadMeToFirstGroup: boolean;
    mixDirectoriesAndFilesAlphabetically: boolean;
    filter?: (meta: object) => boolean;
  },
  relativeDir: string = '',
  currentLevel: number = 1
): DefaultTheme.SidebarItem[] {
  const fileLinks: DefaultTheme.SidebarItem[] = getChildren(
    baseDir,
    relativeDir,
    filter,
    currentLevel > maxLevel
  );
  if (currentLevel <= maxLevel) {
    getDirectories(join(baseDir, relativeDir))
      .filter((subDir) => !subDir.startsWith(navPrefix))
      .forEach((subDir) => {
        const children = side(
          baseDir,
          {
            stripNumbers,
            maxLevel,
            navPrefix,
            skipEmptySidebar,
            addReadMeToFirstGroup,
            mixDirectoriesAndFilesAlphabetically,
            filter,
          },
          join(relativeDir, subDir),
          currentLevel + 1
        );

        if (children.length > 0 || !skipEmptySidebar) {
          // Where to put '02-folder' in ['01-file', { text: 'Other Folder', items: ['03-folder/file'] }]
          const sortedFolderPosition = fileLinks.findIndex((link) => {
            let linkLabel = link?.link ?? '';

            if (link.items) {
              let childrenTitle = '';
              if (typeof link.items[0] == 'string') childrenTitle = link.items[0];
              else if (typeof link.items[0] == 'object')
                childrenTitle = link.items[0].text ?? '';
              linkLabel = childrenTitle.split(sep)[0];
            }

            // Solution below is ugly, but could not find a better way.
            // Previously, subdirs in root level has been compared against dir name, whereas deep subdirs are compared against relative path.
            // Ugly patch below fixes that.
            return relativeDir === '/'
              ? subDir < linkLabel
              : relativeDir + sep + subDir < linkLabel;
          });

          const insertPosition =
            mixDirectoriesAndFilesAlphabetically && sortedFolderPosition > -1
              ? sortedFolderPosition
              : fileLinks.length;

          fileLinks.splice(insertPosition, 0, {
            text: getName(subDir, { stripNumbers, navPrefix }),
            // ...parseSidebarParameters(subDir),
            items: children,
            collapsed: children.length > 0 ? true : false,
          });
        }
      });
  }

  // Remove index.md from first position and add it to first group.
  if (
    addReadMeToFirstGroup &&
    fileLinks[0]?.link === '' &&
    typeof fileLinks[1] === 'object'
  ) {
    fileLinks[1].link = '';
    // fileLinks[1].items?.unshift({ link: '' });
    fileLinks.shift();
  }

  return fileLinks;
}

/**
 * Gets sidebar parameters from directory name. Arguments are given after double dash `--` and separated by comma.
 * - `nc` sets collapsable to `false`.
 * - `dX` sets sidebarDepth to `X`.
 *
 * @param   {String} dirname  - Name of the directory.
 * @returns {Object}          - sidebar parameters.
 * @example
 * parseSidebarParameters("docs/api--nc,d2"); { collapsable: false, sidebarDepth: 2 }
 */
function parseSidebarParameters(dirname: string) {
  const index = dirname.lastIndexOf('--');
  if (index === -1) {
    return {};
  }

  const args = dirname.substring(index + 2).split(',');
  const parameters: { collapsable?: boolean; sidebarDepth?: number } = {};

  args.forEach((arg) => {
    if (arg === 'nc') {
      parameters.collapsable = false;
    } else if (arg.match(/d\d+/)) {
      parameters.sidebarDepth = Number(arg.substring(1));
    }
  });

  return parameters;
}

interface NavItem {
  text: string;
  link?: string;
  items?: NavItem[];
}
/**
 * Returns navbar configuration for given path.
 * @param   {String}          rootDir           - Path of the directory to get navbar configuration for.
 * @param   {Object}          options           - Options
 * @param   {String}          relativeDir       - (Used internally for recursion) Relative directory to `rootDir` to get navconfig for.
 * @param   {Number}          currentNavLevel   - (Used internally for recursion) Recursion level.
 * @returns {Array.<Object>}
 */
function nav(
  rootDir: string,
  {
    navPrefix,
    stripNumbers,
    skipEmptyNavbar,
  }: { navPrefix: string; stripNumbers: boolean; skipEmptyNavbar: boolean },
  relativeDir: string = '/'
): NavItem[] | undefined {
  return _nav(rootDir, { navPrefix, stripNumbers, skipEmptyNavbar }, relativeDir) as
    | NavItem[]
    | undefined;
}
function _nav(
  rootDir: string,
  {
    navPrefix,
    stripNumbers,
    skipEmptyNavbar,
  }: { navPrefix: string; stripNumbers: boolean; skipEmptyNavbar: boolean },
  relativeDir: string = '/',
  currentNavLevel: number = 1
): NavItem | NavItem[] | undefined {
  relativeDir = relativeDir.replace(/\\/g, '/');
  const baseDir = join(rootDir, relativeDir);
  const childrenDirs = getDirectories(baseDir).filter((subDir) =>
    subDir.startsWith(navPrefix)
  );
  const options = { navPrefix, stripNumbers, skipEmptyNavbar };
  let result: NavItem | NavItem[] | undefined;

  if (currentNavLevel > 1 && childrenDirs.length === 0) {
    if (!hasIndex(baseDir)) {
      if (skipEmptyNavbar) {
        return;
      } else {
        throw new Error(
          `index.md file cannot be found in ${baseDir}. VuePress would return 404 for that NavBar link.`
        );
      }
    }
    result = {
      text: getName(baseDir, { stripNumbers, navPrefix }),
      link: relativeDir + '/',
    };
  } else if (childrenDirs.length > 0) {
    const items = childrenDirs
      .map((subDir) =>
        _nav(rootDir, options, join(relativeDir, subDir), currentNavLevel + 1)
      )
      .filter((item): item is NavItem => item !== undefined);
    result =
      currentNavLevel === 1
        ? items
        : { text: getName(baseDir, { stripNumbers, navPrefix }), items };
  }

  return result;
}

/**
 * Returns multiple sidebars for given directory.
 * @param rootDir       - Directory to get navbars for.
 * @param nav           - Navigation configuration (Used for calculating sidebars' roots.)
 * @param options       - Options
 * @param currentLevel  - Recursion level.
 * @returns Multiple navbars.
 */
function multiSide(
  rootDir: string,
  nav: NavItem[],
  options: Required<ConfigOptions>,
  currentLevel: number = 1
): DefaultTheme.Sidebar {
  const sideBar = {};

  nav.forEach((navItem) => {
    if (navItem.link) {
      sideBar[navItem.link] = side(join(rootDir, navItem.link), options);
    } else {
      Object.assign(
        sideBar,
        multiSide(rootDir, navItem.items ?? [], options),
        currentLevel + 1
      );
    }
  });

  if (options.skipEmptySidebar) {
    Object.keys(sideBar).forEach((key) => {
      if (sideBar[key].length === 0) {
        delete sideBar[key];
      }
    });
  }

  if (currentLevel === 1) {
    const fallBackSide = side(rootDir, options);
    const singleEmptyElement =
      fallBackSide.length === 1 && fallBackSide[0].link === ''; // ['']

    if (
      !options.skipEmptySidebar ||
      (fallBackSide.length > 0 && !singleEmptyElement)
    ) {
      // If [''] is present at root level, vuepress does not render sidebar correctly. See `example-with-root-index` test
      sideBar['/'] = side(rootDir, options);
    }
  }

  return sideBar;
}

interface ConfigOptions {
  stripNumbers?: boolean;
  maxLevel?: number;
  navPrefix?: string;
  skipEmptySidebar?: boolean;
  skipEmptyNavbar?: boolean;
  multipleSideBar?: boolean;
  addReadMeToFirstGroup?: boolean;
  mixDirectoriesAndFilesAlphabetically?: boolean;
  pinyinNav?: boolean;
  filter?: (meta: MarkdownItMeta) => boolean;
}
/**
 * Returns `nav` and `sidebar` configuration for VuePress calculated using structrue of directory and files in given path.
 * @param   {Object}    options           - Options
 * @returns {Object}                      - { nav: ..., sidebar: ... } configuration.
 */
export function getConfig(_options?: ConfigOptions) {
  let rootDir = join(dirname(fileURLToPath(parentModule() ?? '')), '..');
  rootDir = rootDir.endsWith(sep) ? rootDir.slice(0, -1) : rootDir; // Remove last / if exists.

  const options: Required<ConfigOptions> = {
    stripNumbers: true,
    maxLevel: 2,
    navPrefix: 'nav',
    skipEmptySidebar: true,
    skipEmptyNavbar: true,
    multipleSideBar: true,
    addReadMeToFirstGroup: true,
    mixDirectoriesAndFilesAlphabetically: true,
    pinyinNav: false,
    filter: () => true,
    ..._options,
  };

  const navItems = nav(rootDir, options);

  const result = {
    nav: navItems || [],
    sidebar:
      options.multipleSideBar && navItems
        ? multiSide(rootDir, navItems, options)
        : side(rootDir, options),
  };

  if (options.pinyinNav && nav.length) {
    result.nav = transliteratePinyin(result.nav);
    result.sidebar = transliteratePinyinSiderbar(result.sidebar);
  }

  // console.log('result', JSON.stringify(result.sidebar[0], null, 2));
  return result;
}
