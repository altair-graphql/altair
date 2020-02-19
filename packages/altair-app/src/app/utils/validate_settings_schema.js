'use strict';
var equal = require('ajv/lib/compile/equal');
var validate = (function() {
  var refVal = [];
  var refVal1 = {
    "enum": ["cs-CZ", "de-DE", "en-US", "es-ES", "fr-FR", "it-IT", "ja-JP", "ko-KR", "pl-PL", "pt-BR", "ro-RO", "ru-RU", "sr-SP", "uk-UA", "vi-VN", "zh-CN"],
    "type": "string"
  };
  refVal[1] = refVal1;
  var refVal2 = {
    "enum": ["dark", "dracula", "light"],
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
              var schema2 = refVal1.enum;
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
                      var data1 = data.theme;
                      if (data1 === undefined) {
                        valid1 = true;
                      } else {
                        var errs_1 = errors;
                        var errs_2 = errors;
                        if (typeof data1 !== "string") {
                          validate.errors = [{
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.theme',
                            schemaPath: '#/definitions/SettingsTheme/type',
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
                            dataPath: (dataPath || '') + '.theme',
                            schemaPath: '#/definitions/SettingsTheme/enum',
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
    "SettingsLanguage": {
      "enum": ["cs-CZ", "de-DE", "en-US", "es-ES", "fr-FR", "it-IT", "ja-JP", "ko-KR", "pl-PL", "pt-BR", "ro-RO", "ru-RU", "sr-SP", "uk-UA", "vi-VN", "zh-CN"],
      "type": "string"
    },
    "SettingsTheme": {
      "enum": ["dark", "dracula", "light"],
      "type": "string"
    }
  },
  "properties": {
    "addQueryDepthLimit": {
      "description": "Specifies how deep the 'Add query' functionality would go",
      "type": "number"
    },
    "disablePushNotification": {
      "description": "Specifies if the push notifications should be disabled",
      "type": "boolean"
    },
    "enableExperimental": {
      "description": "Enable experimental features in Altair.\nNote: The features might be unstable.",
      "type": "boolean"
    },
    "language": {
      "$ref": "#/definitions/SettingsLanguage",
      "description": "Specifies the language e.g. 'en-US', 'fr-FR', 'ru-RU', etc"
    },
    "plugin.list": {
      "description": "Specifies a list of enabled plugins (requires enableExperimental to be true)",
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "request.withCredentials": {
      "description": "Specifies if requests should be sent with credentials (with cookies) or not",
      "type": "boolean"
    },
    "schema.reloadOnStart": {
      "description": "Specifies if the schema should be reloaded when the app starts",
      "type": "boolean"
    },
    "tabSize": {
      "description": "Specifies the tab size in the editor",
      "type": "number"
    },
    "theme": {
      "$ref": "#/definitions/SettingsTheme",
      "description": "Specifies the theme\nOptions: 'light', 'dark', 'dracula'"
    },
    "theme.editorFontFamily": {
      "description": "Specifies the font family for the editors",
      "type": "string"
    },
    "theme.fontsize": {
      "description": "Specifies the base font size\n(Default size - 24)",
      "type": "number"
    }
  },
  "type": "object"
};
validate.errors = null;
module.exports = validate;