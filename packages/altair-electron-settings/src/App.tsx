import {
  Sidebar,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
} from 'flowbite-react';
import { HiWifi } from 'react-icons/hi';
import { NetworkSettings } from './NetworkSettings';

function App() {
  return (
    <div>
      <Sidebar
        aria-label="Default sidebar example"
        className="fixed top-0 left-0 z-40 h-screen"
      >
        <SidebarItems>
          <SidebarItemGroup>
            <SidebarItem icon={HiWifi}>Network</SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>
      <NetworkSettings />
    </div>
  );
}

export default App;
