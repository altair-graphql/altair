'use strict';
var equal = require('ajv/lib/compile/equal');
var validate = (function() {
  var refVal = [];
  var refVal1 = {
    "type": "object"
  };
  refVal[1] = refVal1;
  var refVal2 = {
    "enum": ["cs-CZ", "de-DE", "en-US", "es-ES", "fr-FR", "it-IT", "ja-JP", "ko-KR", "pl-PL", "pt-BR", "ro-RO", "ru-RU", "sr-SP", "uk-UA", "vi-VN", "zh-CN"],
    "type": "string"
  };
  refVal[2] = refVal2;
  return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
    'use strict';
    var vErrors = null;
    var errors = 0;
    if ((data && typeof data === "object" && !Array.isArray(data))) {
      var errs__0 = errors;
      var valid1 = true;
      if (data.addQueryDepthLimit === undefined) {
        valid1 = true;
      } else {
        var errs_1 = errors;
        if (typeof data.addQueryDepthLimit !== "number") {
          validate.errors = [{
            keyword: 'type',
            dataPath: (dataPath || '') + '.addQueryDepthLimit',
            schemaPath: '#/properties/addQueryDepthLimit/type',
            params: {
              type: 'number'
            },
            message: 'should be number'
          }];
          return false;
        }
        var valid1 = errors === errs_1;
      }
      if (valid1) {
        if (data['alert.disableWarnings'] === undefined) {
          valid1 = true;
        } else {
          var errs_1 = errors;
          if (typeof data['alert.disableWarnings'] !== "boolean") {
            validate.errors = [{
              keyword: 'type',
              dataPath: (dataPath || '') + '[\'alert.disableWarnings\']',
              schemaPath: '#/properties/alert.disableWarnings/type',
              params: {
                type: 'boolean'
              },
              message: 'should be boolean'
            }];
            return false;
          }
          var valid1 = errors === errs_1;
        }
        if (valid1) {
          if (data.disablePushNotification === undefined) {
            valid1 = true;
          } else {
            var errs_1 = errors;
            if (typeof data.disablePushNotification !== "boolean") {
              validate.errors = [{
                keyword: 'type',
                dataPath: (dataPath || '') + '.disablePushNotification',
                schemaPath: '#/properties/disablePushNotification/type',
                params: {
                  type: 'boolean'
                },
                message: 'should be boolean'
              }];
              return false;
            }
            var valid1 = errors === errs_1;
          }
          if (valid1) {
            var data1 = data['editor.shortcuts'];
            if (data1 === undefined) {
              valid1 = true;
            } else {
              var errs_1 = errors;
              var errs_2 = errors;
              if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
                validate.errors = [{
                  keyword: 'type',
                  dataPath: (dataPath || '') + '[\'editor.shortcuts\']',
                  schemaPath: '#/definitions/Record<string,string>/type',
                  params: {
                    type: 'object'
                  },
                  message: 'should be object'
                }];
                return false;
              }
              var valid2 = errors === errs_2;
              var valid1 = errors === errs_1;
            }
            if (valid1) {
              if (data.enableExperimental === undefined) {
                valid1 = true;
              } else {
                var errs_1 = errors;
                if (typeof data.enableExperimental !== "boolean") {
                  validate.errors = [{
                    keyword: 'type',
                    dataPath: (dataPath || '') + '.enableExperimental',
                    schemaPath: '#/properties/enableExperimental/type',
                    params: {
                      type: 'boolean'
                    },
                    message: 'should be boolean'
                  }];
                  return false;
                }
                var valid1 = errors === errs_1;
              }
              if (valid1) {
                if (data.historyDepth === undefined) {
                  valid1 = true;
                } else {
                  var errs_1 = errors;
                  if (typeof data.historyDepth !== "number") {
                    validate.errors = [{
                      keyword: 'type',
                      dataPath: (dataPath || '') + '.historyDepth',
                      schemaPath: '#/properties/historyDepth/type',
                      params: {
                        type: 'number'
                      },
                      message: 'should be number'
                    }];
                    return false;
                  }
                  var valid1 = errors === errs_1;
                }
                if (valid1) {
                  var data1 = data.language;
                  if (data1 === undefined) {
                    valid1 = true;
                  } else {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if (typeof data1 !== "string") {
                      validate.errors = [{
                        keyword: 'type',
                        dataPath: (dataPath || '') + '.language',
                        schemaPath: '#/definitions/SettingsLanguage/type',
                        params: {
                          type: 'string'
                        },
                        message: 'should be string'
                      }];
                      return false;
                    }
                    var schema2 = refVal2.enum;
                    var valid2;
                    valid2 = false;
                    for (var i2 = 0; i2 < schema2.length; i2++)
                      if (equal(data1, schema2[i2])) {
                        valid2 = true;
                        break;
                      } if (!valid2) {
                      validate.errors = [{
                        keyword: 'enum',
                        dataPath: (dataPath || '') + '.language',
                        schemaPath: '#/definitions/SettingsLanguage/enum',
                        params: {
                          allowedValues: schema2
                        },
                        message: 'should be equal to one of the allowed values'
                      }];
                      return false;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                  }
                  if (valid1) {
                    var data1 = data['plugin.list'];
                    if (data1 === undefined) {
                      valid1 = true;
                    } else {
                      var errs_1 = errors;
                      if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                          var errs_2 = errors;
                          if (typeof data1[i1] !== "string") {
                            validate.errors = [{
                              keyword: 'type',
                              dataPath: (dataPath || '') + '[\'plugin.list\'][' + i1 + ']',
                              schemaPath: '#/properties/plugin.list/items/type',
                              params: {
                                type: 'string'
                              },
                              message: 'should be string'
                            }];
                            return false;
                          }
                          var valid2 = errors === errs_2;
                          if (!valid2) break;
                        }
                      } else {
                        validate.errors = [{
                          keyword: 'type',
                          dataPath: (dataPath || '') + '[\'plugin.list\']',
                          schemaPath: '#/properties/plugin.list/type',
                          params: {
                            type: 'array'
                          },
                          message: 'should be array'
                        }];
                        return false;
                      }
                      var valid1 = errors === errs_1;
                    }
                    if (valid1) {
                      if (data['request.withCredentials'] === undefined) {
                        valid1 = true;
                      } else {
                        var errs_1 = errors;
                        if (typeof data['request.withCredentials'] !== "boolean") {
                          validate.errors = [{
                            keyword: 'type',
                            dataPath: (dataPath || '') + '[\'request.withCredentials\']',
                            schemaPath: '#/properties/request.withCredentials/type',
                            params: {
                              type: 'boolean'
                            },
                            message: 'should be boolean'
                          }];
                          return false;
                        }
                        var valid1 = errors === errs_1;
                      }
                      if (valid1) {
                        if (data['response.hideExtensions'] === undefined) {
                          valid1 = true;
                        } else {
                          var errs_1 = errors;
                          if (typeof data['response.hideExtensions'] !== "boolean") {
                            validate.errors = [{
                              keyword: 'type',
                              dataPath: (dataPath || '') + '[\'response.hideExtensions\']',
                              schemaPath: '#/properties/response.hideExtensions/type',
                              params: {
                                type: 'boolean'
                              },
                              message: 'should be boolean'
                            }];
                            return false;
                          }
                          var valid1 = errors === errs_1;
                        }
                        if (valid1) {
                          if (data['schema.reloadOnStart'] === undefined) {
                            valid1 = true;
                          } else {
                            var errs_1 = errors;
                            if (typeof data['schema.reloadOnStart'] !== "boolean") {
                              validate.errors = [{
                                keyword: 'type',
                                dataPath: (dataPath || '') + '[\'schema.reloadOnStart\']',
                                schemaPath: '#/properties/schema.reloadOnStart/type',
                                params: {
                                  type: 'boolean'
                                },
                                message: 'should be boolean'
                              }];
                              return false;
                            }
                            var valid1 = errors === errs_1;
                          }
                          if (valid1) {
                            if (data.tabSize === undefined) {
                              valid1 = true;
                            } else {
                              var errs_1 = errors;
                              if (typeof data.tabSize !== "number") {
                                validate.errors = [{
                                  keyword: 'type',
                                  dataPath: (dataPath || '') + '.tabSize',
                                  schemaPath: '#/properties/tabSize/type',
                                  params: {
                                    type: 'number'
                                  },
                                  message: 'should be number'
                                }];
                                return false;
                              }
                              var valid1 = errors === errs_1;
                            }
                            if (valid1) {
                              if (data.theme === undefined) {
                                valid1 = true;
                              } else {
                                var errs_1 = errors;
                                if (typeof data.theme !== "string") {
                                  validate.errors = [{
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.theme',
                                    schemaPath: '#/properties/theme/type',
                                    params: {
                                      type: 'string'
                                    },
                                    message: 'should be string'
                                  }];
                                  return false;
                                }
                                var valid1 = errors === errs_1;
                              }
                              if (valid1) {
                                if (data['theme.dark'] === undefined) {
                                  valid1 = true;
                                } else {
                                  var errs_1 = errors;
                                  if (typeof data['theme.dark'] !== "string") {
                                    validate.errors = [{
                                      keyword: 'type',
                                      dataPath: (dataPath || '') + '[\'theme.dark\']',
                                      schemaPath: '#/properties/theme.dark/type',
                                      params: {
                                        type: 'string'
                                      },
                                      message: 'should be string'
                                    }];
                                    return false;
                                  }
                                  var valid1 = errors === errs_1;
                                }
                                if (valid1) {
                                  if (data['theme.editorFontFamily'] === undefined) {
                                    valid1 = true;
                                  } else {
                                    var errs_1 = errors;
                                    if (typeof data['theme.editorFontFamily'] !== "string") {
                                      validate.errors = [{
                                        keyword: 'type',
                                        dataPath: (dataPath || '') + '[\'theme.editorFontFamily\']',
                                        schemaPath: '#/properties/theme.editorFontFamily/type',
                                        params: {
                                          type: 'string'
                                        },
                                        message: 'should be string'
                                      }];
                                      return false;
                                    }
                                    var valid1 = errors === errs_1;
                                  }
                                  if (valid1) {
                                    if (data['theme.editorFontSize'] === undefined) {
                                      valid1 = true;
                                    } else {
                                      var errs_1 = errors;
                                      if (typeof data['theme.editorFontSize'] !== "number") {
                                        validate.errors = [{
                                          keyword: 'type',
                                          dataPath: (dataPath || '') + '[\'theme.editorFontSize\']',
                                          schemaPath: '#/properties/theme.editorFontSize/type',
                                          params: {
                                            type: 'number'
                                          },
                                          message: 'should be number'
                                        }];
                                        return false;
                                      }
                                      var valid1 = errors === errs_1;
                                    }
                                    if (valid1) {
                                      if (data['theme.fontsize'] === undefined) {
                                        valid1 = true;
                                      } else {
                                        var errs_1 = errors;
                                        if (typeof data['theme.fontsize'] !== "number") {
                                          validate.errors = [{
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '[\'theme.fontsize\']',
                                            schemaPath: '#/properties/theme.fontsize/type',
                                            params: {
                                              type: 'number'
                                            },
                                            message: 'should be number'
                                          }];
                                          return false;
                                        }
                                        var valid1 = errors === errs_1;
                                      }
                                      if (valid1) {}
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate.errors = [{
        keyword: 'type',
        dataPath: (dataPath || '') + "",
        schemaPath: '#/type',
        params: {
          type: 'object'
        },
        message: 'should be object'
      }];
      return false;
    }
    validate.errors = vErrors;
    return errors === 0;
  };
})();
validate.schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "Record<string,string>": {
      "type": "object"
    },
    "SettingsLanguage": {
      "enum": ["cs-CZ", "de-DE", "en-US", "es-ES", "fr-FR", "it-IT", "ja-JP", "ko-KR", "pl-PL", "pt-BR", "ro-RO", "ru-RU", "sr-SP", "uk-UA", "vi-VN", "zh-CN"],
      "type": "string"
    }
  },
  "properties": {
    "addQueryDepthLimit": {
      "description": "'Add query' functionality depth",
      "type": "number"
    },
    "alert.disableWarnings": {
      "description": "Disable warning alerts",
      "type": "boolean"
    },
    "disablePushNotification": {
      "description": "Disable push notifications",
      "type": "boolean"
    },
    "editor.shortcuts": {
      "$ref": "#/definitions/Record<string,string>",
      "description": "Contains shortcut to action mapping"
    },
    "enableExperimental": {
      "description": "Enable experimental features.\nNote: Might be unstable",
      "type": "boolean"
    },
    "historyDepth": {
      "description": "Number of items allowed in history pane",
      "type": "number"
    },
    "language": {
      "$ref": "#/definitions/SettingsLanguage",
      "description": "Set language"
    },
    "plugin.list": {
      "description": "Enabled plugins",
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "request.withCredentials": {
      "description": "Send requests with credentials (cookies)",
      "type": "boolean"
    },
    "response.hideExtensions": {
      "description": "Hides extensions object",
      "type": "boolean"
    },
    "schema.reloadOnStart": {
      "description": "Reload schema on app start",
      "type": "boolean"
    },
    "tabSize": {
      "description": "Editor tab size",
      "type": "number"
    },
    "theme": {
      "description": "Theme",
      "type": "string"
    },
    "theme.dark": {
      "description": "Theme for dark mode",
      "type": "string"
    },
    "theme.editorFontFamily": {
      "description": "Editor Font Family",
      "type": "string"
    },
    "theme.editorFontSize": {
      "description": "Editor Font Size",
      "type": "number"
    },
    "theme.fontsize": {
      "description": "Base Font Size\n(Default - 24)",
      "type": "number"
    },
    "themeConfig": {
      "description": "Theme config object"
    },
    "themeConfig.dark": {
      "description": "Theme config object for dark mode"
    }
  },
  "type": "object"
};
validate.errors = null;
module.exports = validate;