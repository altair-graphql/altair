'use strict';
var equal = require('ajv/lib/compile/equal');
var validate = (function() {
  var refVal = [];
  var refVal1 = {
    "enum": ["cs-CZ", "de-DE", "en-US", "es-ES", "fr-FR", "it-IT", "ja-JP", "ko-KR", "pl-PL", "pt-BR", "ro-RO", "ru-RU", "sr-SP", "uk-UA", "vi-VN", "zh-CN"],
    "type": "string"
  };
  refVal[1] = refVal1;
  var refVal2 = (function() {
    return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
      'use strict';
      var vErrors = null;
      var errors = 0;
      if (rootData === undefined) rootData = data;
      if ((data && typeof data === "object" && !Array.isArray(data))) {
        var errs__0 = errors;
        var valid1 = true;
        var data1 = data.colors;
        if (data1 === undefined) {
          valid1 = true;
        } else {
          var errs_1 = errors;
          var errs_2 = errors;
          if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
            var errs__2 = errors;
            var valid3 = true;
            if (data1.bg === undefined) {
              valid3 = true;
            } else {
              var errs_3 = errors;
              if (typeof data1.bg !== "string") {
                validate.errors = [{
                  keyword: 'type',
                  dataPath: (dataPath || '') + '.colors.bg',
                  schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/bg/type',
                  params: {
                    type: 'string'
                  },
                  message: 'should be string'
                }];
                return false;
              }
              var valid3 = errors === errs_3;
            }
            if (valid3) {
              if (data1.black === undefined) {
                valid3 = true;
              } else {
                var errs_3 = errors;
                if (typeof data1.black !== "string") {
                  validate.errors = [{
                    keyword: 'type',
                    dataPath: (dataPath || '') + '.colors.black',
                    schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/black/type',
                    params: {
                      type: 'string'
                    },
                    message: 'should be string'
                  }];
                  return false;
                }
                var valid3 = errors === errs_3;
              }
              if (valid3) {
                if (data1.blue === undefined) {
                  valid3 = true;
                } else {
                  var errs_3 = errors;
                  if (typeof data1.blue !== "string") {
                    validate.errors = [{
                      keyword: 'type',
                      dataPath: (dataPath || '') + '.colors.blue',
                      schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/blue/type',
                      params: {
                        type: 'string'
                      },
                      message: 'should be string'
                    }];
                    return false;
                  }
                  var valid3 = errors === errs_3;
                }
                if (valid3) {
                  if (data1.border === undefined) {
                    valid3 = true;
                  } else {
                    var errs_3 = errors;
                    if (typeof data1.border !== "string") {
                      validate.errors = [{
                        keyword: 'type',
                        dataPath: (dataPath || '') + '.colors.border',
                        schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/border/type',
                        params: {
                          type: 'string'
                        },
                        message: 'should be string'
                      }];
                      return false;
                    }
                    var valid3 = errors === errs_3;
                  }
                  if (valid3) {
                    if (data1.cerise === undefined) {
                      valid3 = true;
                    } else {
                      var errs_3 = errors;
                      if (typeof data1.cerise !== "string") {
                        validate.errors = [{
                          keyword: 'type',
                          dataPath: (dataPath || '') + '.colors.cerise',
                          schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/cerise/type',
                          params: {
                            type: 'string'
                          },
                          message: 'should be string'
                        }];
                        return false;
                      }
                      var valid3 = errors === errs_3;
                    }
                    if (valid3) {
                      if (data1.darkGray === undefined) {
                        valid3 = true;
                      } else {
                        var errs_3 = errors;
                        if (typeof data1.darkGray !== "string") {
                          validate.errors = [{
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.colors.darkGray',
                            schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/darkGray/type',
                            params: {
                              type: 'string'
                            },
                            message: 'should be string'
                          }];
                          return false;
                        }
                        var valid3 = errors === errs_3;
                      }
                      if (valid3) {
                        if (data1.darkPurple === undefined) {
                          valid3 = true;
                        } else {
                          var errs_3 = errors;
                          if (typeof data1.darkPurple !== "string") {
                            validate.errors = [{
                              keyword: 'type',
                              dataPath: (dataPath || '') + '.colors.darkPurple',
                              schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/darkPurple/type',
                              params: {
                                type: 'string'
                              },
                              message: 'should be string'
                            }];
                            return false;
                          }
                          var valid3 = errors === errs_3;
                        }
                        if (valid3) {
                          if (data1.font === undefined) {
                            valid3 = true;
                          } else {
                            var errs_3 = errors;
                            if (typeof data1.font !== "string") {
                              validate.errors = [{
                                keyword: 'type',
                                dataPath: (dataPath || '') + '.colors.font',
                                schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/font/type',
                                params: {
                                  type: 'string'
                                },
                                message: 'should be string'
                              }];
                              return false;
                            }
                            var valid3 = errors === errs_3;
                          }
                          if (valid3) {
                            if (data1.gray === undefined) {
                              valid3 = true;
                            } else {
                              var errs_3 = errors;
                              if (typeof data1.gray !== "string") {
                                validate.errors = [{
                                  keyword: 'type',
                                  dataPath: (dataPath || '') + '.colors.gray',
                                  schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/gray/type',
                                  params: {
                                    type: 'string'
                                  },
                                  message: 'should be string'
                                }];
                                return false;
                              }
                              var valid3 = errors === errs_3;
                            }
                            if (valid3) {
                              if (data1.green === undefined) {
                                valid3 = true;
                              } else {
                                var errs_3 = errors;
                                if (typeof data1.green !== "string") {
                                  validate.errors = [{
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.colors.green',
                                    schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/green/type',
                                    params: {
                                      type: 'string'
                                    },
                                    message: 'should be string'
                                  }];
                                  return false;
                                }
                                var valid3 = errors === errs_3;
                              }
                              if (valid3) {
                                if (data1.headerBg === undefined) {
                                  valid3 = true;
                                } else {
                                  var errs_3 = errors;
                                  if (typeof data1.headerBg !== "string") {
                                    validate.errors = [{
                                      keyword: 'type',
                                      dataPath: (dataPath || '') + '.colors.headerBg',
                                      schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/headerBg/type',
                                      params: {
                                        type: 'string'
                                      },
                                      message: 'should be string'
                                    }];
                                    return false;
                                  }
                                  var valid3 = errors === errs_3;
                                }
                                if (valid3) {
                                  if (data1.lightGray === undefined) {
                                    valid3 = true;
                                  } else {
                                    var errs_3 = errors;
                                    if (typeof data1.lightGray !== "string") {
                                      validate.errors = [{
                                        keyword: 'type',
                                        dataPath: (dataPath || '') + '.colors.lightGray',
                                        schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/lightGray/type',
                                        params: {
                                          type: 'string'
                                        },
                                        message: 'should be string'
                                      }];
                                      return false;
                                    }
                                    var valid3 = errors === errs_3;
                                  }
                                  if (valid3) {
                                    if (data1.lightRed === undefined) {
                                      valid3 = true;
                                    } else {
                                      var errs_3 = errors;
                                      if (typeof data1.lightRed !== "string") {
                                        validate.errors = [{
                                          keyword: 'type',
                                          dataPath: (dataPath || '') + '.colors.lightRed',
                                          schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/lightRed/type',
                                          params: {
                                            type: 'string'
                                          },
                                          message: 'should be string'
                                        }];
                                        return false;
                                      }
                                      var valid3 = errors === errs_3;
                                    }
                                    if (valid3) {
                                      if (data1.offBg === undefined) {
                                        valid3 = true;
                                      } else {
                                        var errs_3 = errors;
                                        if (typeof data1.offBg !== "string") {
                                          validate.errors = [{
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.colors.offBg',
                                            schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/offBg/type',
                                            params: {
                                              type: 'string'
                                            },
                                            message: 'should be string'
                                          }];
                                          return false;
                                        }
                                        var valid3 = errors === errs_3;
                                      }
                                      if (valid3) {
                                        if (data1.offBorder === undefined) {
                                          valid3 = true;
                                        } else {
                                          var errs_3 = errors;
                                          if (typeof data1.offBorder !== "string") {
                                            validate.errors = [{
                                              keyword: 'type',
                                              dataPath: (dataPath || '') + '.colors.offBorder',
                                              schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/offBorder/type',
                                              params: {
                                                type: 'string'
                                              },
                                              message: 'should be string'
                                            }];
                                            return false;
                                          }
                                          var valid3 = errors === errs_3;
                                        }
                                        if (valid3) {
                                          if (data1.offFont === undefined) {
                                            valid3 = true;
                                          } else {
                                            var errs_3 = errors;
                                            if (typeof data1.offFont !== "string") {
                                              validate.errors = [{
                                                keyword: 'type',
                                                dataPath: (dataPath || '') + '.colors.offFont',
                                                schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/offFont/type',
                                                params: {
                                                  type: 'string'
                                                },
                                                message: 'should be string'
                                              }];
                                              return false;
                                            }
                                            var valid3 = errors === errs_3;
                                          }
                                          if (valid3) {
                                            if (data1.orange === undefined) {
                                              valid3 = true;
                                            } else {
                                              var errs_3 = errors;
                                              if (typeof data1.orange !== "string") {
                                                validate.errors = [{
                                                  keyword: 'type',
                                                  dataPath: (dataPath || '') + '.colors.orange',
                                                  schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/orange/type',
                                                  params: {
                                                    type: 'string'
                                                  },
                                                  message: 'should be string'
                                                }];
                                                return false;
                                              }
                                              var valid3 = errors === errs_3;
                                            }
                                            if (valid3) {
                                              if (data1.primary === undefined) {
                                                valid3 = true;
                                              } else {
                                                var errs_3 = errors;
                                                if (typeof data1.primary !== "string") {
                                                  validate.errors = [{
                                                    keyword: 'type',
                                                    dataPath: (dataPath || '') + '.colors.primary',
                                                    schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/primary/type',
                                                    params: {
                                                      type: 'string'
                                                    },
                                                    message: 'should be string'
                                                  }];
                                                  return false;
                                                }
                                                var valid3 = errors === errs_3;
                                              }
                                              if (valid3) {
                                                if (data1.red === undefined) {
                                                  valid3 = true;
                                                } else {
                                                  var errs_3 = errors;
                                                  if (typeof data1.red !== "string") {
                                                    validate.errors = [{
                                                      keyword: 'type',
                                                      dataPath: (dataPath || '') + '.colors.red',
                                                      schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/red/type',
                                                      params: {
                                                        type: 'string'
                                                      },
                                                      message: 'should be string'
                                                    }];
                                                    return false;
                                                  }
                                                  var valid3 = errors === errs_3;
                                                }
                                                if (valid3) {
                                                  if (data1.secondary === undefined) {
                                                    valid3 = true;
                                                  } else {
                                                    var errs_3 = errors;
                                                    if (typeof data1.secondary !== "string") {
                                                      validate.errors = [{
                                                        keyword: 'type',
                                                        dataPath: (dataPath || '') + '.colors.secondary',
                                                        schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/secondary/type',
                                                        params: {
                                                          type: 'string'
                                                        },
                                                        message: 'should be string'
                                                      }];
                                                      return false;
                                                    }
                                                    var valid3 = errors === errs_3;
                                                  }
                                                  if (valid3) {
                                                    if (data1.white === undefined) {
                                                      valid3 = true;
                                                    } else {
                                                      var errs_3 = errors;
                                                      if (typeof data1.white !== "string") {
                                                        validate.errors = [{
                                                          keyword: 'type',
                                                          dataPath: (dataPath || '') + '.colors.white',
                                                          schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/white/type',
                                                          params: {
                                                            type: 'string'
                                                          },
                                                          message: 'should be string'
                                                        }];
                                                        return false;
                                                      }
                                                      var valid3 = errors === errs_3;
                                                    }
                                                    if (valid3) {
                                                      if (data1.yellow === undefined) {
                                                        valid3 = true;
                                                      } else {
                                                        var errs_3 = errors;
                                                        if (typeof data1.yellow !== "string") {
                                                          validate.errors = [{
                                                            keyword: 'type',
                                                            dataPath: (dataPath || '') + '.colors.yellow',
                                                            schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/properties/yellow/type',
                                                            params: {
                                                              type: 'string'
                                                            },
                                                            message: 'should be string'
                                                          }];
                                                          return false;
                                                        }
                                                        var valid3 = errors === errs_3;
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
                      }
                    }
                  }
                }
              }
            }
          } else {
            validate.errors = [{
              keyword: 'type',
              dataPath: (dataPath || '') + '.colors',
              schemaPath: '#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>/type',
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
          if (data.easing === undefined) {
            valid1 = true;
          } else {
            var errs_1 = errors;
            if (typeof data.easing !== "string") {
              validate.errors = [{
                keyword: 'type',
                dataPath: (dataPath || '') + '.easing',
                schemaPath: '#/properties/easing/type',
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
            if (data.editor === undefined) {
              valid1 = true;
            } else {
              var errs_1 = errors;
              if (!refVal4(data.editor, (dataPath || '') + '.editor', data, 'editor', rootData)) {
                if (vErrors === null) vErrors = refVal4.errors;
                else vErrors = vErrors.concat(refVal4.errors);
                errors = vErrors.length;
              }
              var valid1 = errors === errs_1;
            }
            if (valid1) {
              if (data.isSystem === undefined) {
                valid1 = true;
              } else {
                var errs_1 = errors;
                if (typeof data.isSystem !== "boolean") {
                  validate.errors = [{
                    keyword: 'type',
                    dataPath: (dataPath || '') + '.isSystem',
                    schemaPath: '#/properties/isSystem/type',
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
                var data1 = data.shadow;
                if (data1 === undefined) {
                  valid1 = true;
                } else {
                  var errs_1 = errors;
                  var errs_2 = errors;
                  if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                    var errs__2 = errors;
                    var valid3 = true;
                    if (data1.color === undefined) {
                      valid3 = true;
                    } else {
                      var errs_3 = errors;
                      if (typeof data1.color !== "string") {
                        validate.errors = [{
                          keyword: 'type',
                          dataPath: (dataPath || '') + '.shadow.color',
                          schemaPath: '#/definitions/RecursivePartial<{color:string;opacity:number;}>/properties/color/type',
                          params: {
                            type: 'string'
                          },
                          message: 'should be string'
                        }];
                        return false;
                      }
                      var valid3 = errors === errs_3;
                    }
                    if (valid3) {
                      if (data1.opacity === undefined) {
                        valid3 = true;
                      } else {
                        var errs_3 = errors;
                        if (typeof data1.opacity !== "number") {
                          validate.errors = [{
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.shadow.opacity',
                            schemaPath: '#/definitions/RecursivePartial<{color:string;opacity:number;}>/properties/opacity/type',
                            params: {
                              type: 'number'
                            },
                            message: 'should be number'
                          }];
                          return false;
                        }
                        var valid3 = errors === errs_3;
                      }
                    }
                  } else {
                    validate.errors = [{
                      keyword: 'type',
                      dataPath: (dataPath || '') + '.shadow',
                      schemaPath: '#/definitions/RecursivePartial<{color:string;opacity:number;}>/type',
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
                  if (data.type === undefined) {
                    valid1 = true;
                  } else {
                    var errs_1 = errors;
                    if (!refVal8(data.type, (dataPath || '') + '.type', data, 'type', rootData)) {
                      if (vErrors === null) vErrors = refVal8.errors;
                      else vErrors = vErrors.concat(refVal8.errors);
                      errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
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
  refVal2.schema = {
    "properties": {
      "colors": {
        "$ref": "#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>"
      },
      "easing": {
        "type": "string"
      },
      "editor": {
        "$ref": "#/definitions/RecursivePartial<{fontFamily:{default:string;};fontSize:number;colors:{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;};}>"
      },
      "isSystem": {
        "type": "boolean"
      },
      "shadow": {
        "$ref": "#/definitions/RecursivePartial<{color:string;opacity:number;}>"
      },
      "type": {
        "$ref": "#/definitions/RecursivePartial<{fontSize:{base:number;remBase:number;body:number;};fontFamily:{default:string;};}>"
      }
    },
    "type": "object"
  };
  refVal2.errors = null;
  refVal[2] = refVal2;
  var refVal3 = {
    "properties": {
      "bg": {
        "type": "string"
      },
      "black": {
        "type": "string"
      },
      "blue": {
        "type": "string"
      },
      "border": {
        "type": "string"
      },
      "cerise": {
        "type": "string"
      },
      "darkGray": {
        "type": "string"
      },
      "darkPurple": {
        "type": "string"
      },
      "font": {
        "type": "string"
      },
      "gray": {
        "type": "string"
      },
      "green": {
        "type": "string"
      },
      "headerBg": {
        "type": "string"
      },
      "lightGray": {
        "type": "string"
      },
      "lightRed": {
        "type": "string"
      },
      "offBg": {
        "type": "string"
      },
      "offBorder": {
        "type": "string"
      },
      "offFont": {
        "type": "string"
      },
      "orange": {
        "type": "string"
      },
      "primary": {
        "type": "string"
      },
      "red": {
        "type": "string"
      },
      "secondary": {
        "type": "string"
      },
      "white": {
        "type": "string"
      },
      "yellow": {
        "type": "string"
      }
    },
    "type": "object"
  };
  refVal[3] = refVal3;
  var refVal4 = (function() {
    return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
      'use strict';
      var vErrors = null;
      var errors = 0;
      if ((data && typeof data === "object" && !Array.isArray(data))) {
        var errs__0 = errors;
        var valid1 = true;
        var data1 = data.colors;
        if (data1 === undefined) {
          valid1 = true;
        } else {
          var errs_1 = errors;
          var errs_2 = errors;
          if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
            var errs__2 = errors;
            var valid3 = true;
            if (data1.atom === undefined) {
              valid3 = true;
            } else {
              var errs_3 = errors;
              if (typeof data1.atom !== "string") {
                validate.errors = [{
                  keyword: 'type',
                  dataPath: (dataPath || '') + '.colors.atom',
                  schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/atom/type',
                  params: {
                    type: 'string'
                  },
                  message: 'should be string'
                }];
                return false;
              }
              var valid3 = errors === errs_3;
            }
            if (valid3) {
              if (data1.attribute === undefined) {
                valid3 = true;
              } else {
                var errs_3 = errors;
                if (typeof data1.attribute !== "string") {
                  validate.errors = [{
                    keyword: 'type',
                    dataPath: (dataPath || '') + '.colors.attribute',
                    schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/attribute/type',
                    params: {
                      type: 'string'
                    },
                    message: 'should be string'
                  }];
                  return false;
                }
                var valid3 = errors === errs_3;
              }
              if (valid3) {
                if (data1.builtin === undefined) {
                  valid3 = true;
                } else {
                  var errs_3 = errors;
                  if (typeof data1.builtin !== "string") {
                    validate.errors = [{
                      keyword: 'type',
                      dataPath: (dataPath || '') + '.colors.builtin',
                      schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/builtin/type',
                      params: {
                        type: 'string'
                      },
                      message: 'should be string'
                    }];
                    return false;
                  }
                  var valid3 = errors === errs_3;
                }
                if (valid3) {
                  if (data1.comment === undefined) {
                    valid3 = true;
                  } else {
                    var errs_3 = errors;
                    if (typeof data1.comment !== "string") {
                      validate.errors = [{
                        keyword: 'type',
                        dataPath: (dataPath || '') + '.colors.comment',
                        schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/comment/type',
                        params: {
                          type: 'string'
                        },
                        message: 'should be string'
                      }];
                      return false;
                    }
                    var valid3 = errors === errs_3;
                  }
                  if (valid3) {
                    if (data1.cursor === undefined) {
                      valid3 = true;
                    } else {
                      var errs_3 = errors;
                      if (typeof data1.cursor !== "string") {
                        validate.errors = [{
                          keyword: 'type',
                          dataPath: (dataPath || '') + '.colors.cursor',
                          schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/cursor/type',
                          params: {
                            type: 'string'
                          },
                          message: 'should be string'
                        }];
                        return false;
                      }
                      var valid3 = errors === errs_3;
                    }
                    if (valid3) {
                      if (data1.definition === undefined) {
                        valid3 = true;
                      } else {
                        var errs_3 = errors;
                        if (typeof data1.definition !== "string") {
                          validate.errors = [{
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.colors.definition',
                            schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/definition/type',
                            params: {
                              type: 'string'
                            },
                            message: 'should be string'
                          }];
                          return false;
                        }
                        var valid3 = errors === errs_3;
                      }
                      if (valid3) {
                        if (data1.keyword === undefined) {
                          valid3 = true;
                        } else {
                          var errs_3 = errors;
                          if (typeof data1.keyword !== "string") {
                            validate.errors = [{
                              keyword: 'type',
                              dataPath: (dataPath || '') + '.colors.keyword',
                              schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/keyword/type',
                              params: {
                                type: 'string'
                              },
                              message: 'should be string'
                            }];
                            return false;
                          }
                          var valid3 = errors === errs_3;
                        }
                        if (valid3) {
                          if (data1.number === undefined) {
                            valid3 = true;
                          } else {
                            var errs_3 = errors;
                            if (typeof data1.number !== "string") {
                              validate.errors = [{
                                keyword: 'type',
                                dataPath: (dataPath || '') + '.colors.number',
                                schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/number/type',
                                params: {
                                  type: 'string'
                                },
                                message: 'should be string'
                              }];
                              return false;
                            }
                            var valid3 = errors === errs_3;
                          }
                          if (valid3) {
                            if (data1.property === undefined) {
                              valid3 = true;
                            } else {
                              var errs_3 = errors;
                              if (typeof data1.property !== "string") {
                                validate.errors = [{
                                  keyword: 'type',
                                  dataPath: (dataPath || '') + '.colors.property',
                                  schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/property/type',
                                  params: {
                                    type: 'string'
                                  },
                                  message: 'should be string'
                                }];
                                return false;
                              }
                              var valid3 = errors === errs_3;
                            }
                            if (valid3) {
                              if (data1.punctuation === undefined) {
                                valid3 = true;
                              } else {
                                var errs_3 = errors;
                                if (typeof data1.punctuation !== "string") {
                                  validate.errors = [{
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.colors.punctuation',
                                    schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/punctuation/type',
                                    params: {
                                      type: 'string'
                                    },
                                    message: 'should be string'
                                  }];
                                  return false;
                                }
                                var valid3 = errors === errs_3;
                              }
                              if (valid3) {
                                if (data1.string === undefined) {
                                  valid3 = true;
                                } else {
                                  var errs_3 = errors;
                                  if (typeof data1.string !== "string") {
                                    validate.errors = [{
                                      keyword: 'type',
                                      dataPath: (dataPath || '') + '.colors.string',
                                      schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/string/type',
                                      params: {
                                        type: 'string'
                                      },
                                      message: 'should be string'
                                    }];
                                    return false;
                                  }
                                  var valid3 = errors === errs_3;
                                }
                                if (valid3) {
                                  if (data1.variable === undefined) {
                                    valid3 = true;
                                  } else {
                                    var errs_3 = errors;
                                    if (typeof data1.variable !== "string") {
                                      validate.errors = [{
                                        keyword: 'type',
                                        dataPath: (dataPath || '') + '.colors.variable',
                                        schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/properties/variable/type',
                                        params: {
                                          type: 'string'
                                        },
                                        message: 'should be string'
                                      }];
                                      return false;
                                    }
                                    var valid3 = errors === errs_3;
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
              dataPath: (dataPath || '') + '.colors',
              schemaPath: '#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>/type',
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
          var data1 = data.fontFamily;
          if (data1 === undefined) {
            valid1 = true;
          } else {
            var errs_1 = errors;
            var errs_2 = errors;
            if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
              var errs__2 = errors;
              var valid3 = true;
              if (data1.default === undefined) {
                valid3 = true;
              } else {
                var errs_3 = errors;
                if (typeof data1.default !== "string") {
                  validate.errors = [{
                    keyword: 'type',
                    dataPath: (dataPath || '') + '.fontFamily.default',
                    schemaPath: '#/definitions/RecursivePartial<{default:string;}>_1/properties/default/type',
                    params: {
                      type: 'string'
                    },
                    message: 'should be string'
                  }];
                  return false;
                }
                var valid3 = errors === errs_3;
              }
            } else {
              validate.errors = [{
                keyword: 'type',
                dataPath: (dataPath || '') + '.fontFamily',
                schemaPath: '#/definitions/RecursivePartial<{default:string;}>_1/type',
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
            if (data.fontSize === undefined) {
              valid1 = true;
            } else {
              var errs_1 = errors;
              if (typeof data.fontSize !== "number") {
                validate.errors = [{
                  keyword: 'type',
                  dataPath: (dataPath || '') + '.fontSize',
                  schemaPath: '#/properties/fontSize/type',
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
  refVal4.schema = {
    "properties": {
      "colors": {
        "$ref": "#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>"
      },
      "fontFamily": {
        "$ref": "#/definitions/RecursivePartial<{default:string;}>_1"
      },
      "fontSize": {
        "type": "number"
      }
    },
    "type": "object"
  };
  refVal4.errors = null;
  refVal[4] = refVal4;
  var refVal5 = {
    "properties": {
      "atom": {
        "type": "string"
      },
      "attribute": {
        "type": "string"
      },
      "builtin": {
        "type": "string"
      },
      "comment": {
        "type": "string"
      },
      "cursor": {
        "type": "string"
      },
      "definition": {
        "type": "string"
      },
      "keyword": {
        "type": "string"
      },
      "number": {
        "type": "string"
      },
      "property": {
        "type": "string"
      },
      "punctuation": {
        "type": "string"
      },
      "string": {
        "type": "string"
      },
      "variable": {
        "type": "string"
      }
    },
    "type": "object"
  };
  refVal[5] = refVal5;
  var refVal6 = {
    "properties": {
      "default": {
        "type": "string"
      }
    },
    "type": "object"
  };
  refVal[6] = refVal6;
  var refVal7 = {
    "properties": {
      "color": {
        "type": "string"
      },
      "opacity": {
        "type": "number"
      }
    },
    "type": "object"
  };
  refVal[7] = refVal7;
  var refVal8 = (function() {
    return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
      'use strict';
      var vErrors = null;
      var errors = 0;
      if ((data && typeof data === "object" && !Array.isArray(data))) {
        var errs__0 = errors;
        var valid1 = true;
        var data1 = data.fontFamily;
        if (data1 === undefined) {
          valid1 = true;
        } else {
          var errs_1 = errors;
          var errs_2 = errors;
          if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
            var errs__2 = errors;
            var valid3 = true;
            if (data1.default === undefined) {
              valid3 = true;
            } else {
              var errs_3 = errors;
              if (typeof data1.default !== "string") {
                validate.errors = [{
                  keyword: 'type',
                  dataPath: (dataPath || '') + '.fontFamily.default',
                  schemaPath: '#/definitions/RecursivePartial<{default:string;}>/properties/default/type',
                  params: {
                    type: 'string'
                  },
                  message: 'should be string'
                }];
                return false;
              }
              var valid3 = errors === errs_3;
            }
          } else {
            validate.errors = [{
              keyword: 'type',
              dataPath: (dataPath || '') + '.fontFamily',
              schemaPath: '#/definitions/RecursivePartial<{default:string;}>/type',
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
          var data1 = data.fontSize;
          if (data1 === undefined) {
            valid1 = true;
          } else {
            var errs_1 = errors;
            var errs_2 = errors;
            if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
              var errs__2 = errors;
              var valid3 = true;
              if (data1.base === undefined) {
                valid3 = true;
              } else {
                var errs_3 = errors;
                if (typeof data1.base !== "number") {
                  validate.errors = [{
                    keyword: 'type',
                    dataPath: (dataPath || '') + '.fontSize.base',
                    schemaPath: '#/definitions/RecursivePartial<{base:number;remBase:number;body:number;}>/properties/base/type',
                    params: {
                      type: 'number'
                    },
                    message: 'should be number'
                  }];
                  return false;
                }
                var valid3 = errors === errs_3;
              }
              if (valid3) {
                if (data1.body === undefined) {
                  valid3 = true;
                } else {
                  var errs_3 = errors;
                  if (typeof data1.body !== "number") {
                    validate.errors = [{
                      keyword: 'type',
                      dataPath: (dataPath || '') + '.fontSize.body',
                      schemaPath: '#/definitions/RecursivePartial<{base:number;remBase:number;body:number;}>/properties/body/type',
                      params: {
                        type: 'number'
                      },
                      message: 'should be number'
                    }];
                    return false;
                  }
                  var valid3 = errors === errs_3;
                }
                if (valid3) {
                  if (data1.remBase === undefined) {
                    valid3 = true;
                  } else {
                    var errs_3 = errors;
                    if (typeof data1.remBase !== "number") {
                      validate.errors = [{
                        keyword: 'type',
                        dataPath: (dataPath || '') + '.fontSize.remBase',
                        schemaPath: '#/definitions/RecursivePartial<{base:number;remBase:number;body:number;}>/properties/remBase/type',
                        params: {
                          type: 'number'
                        },
                        message: 'should be number'
                      }];
                      return false;
                    }
                    var valid3 = errors === errs_3;
                  }
                }
              }
            } else {
              validate.errors = [{
                keyword: 'type',
                dataPath: (dataPath || '') + '.fontSize',
                schemaPath: '#/definitions/RecursivePartial<{base:number;remBase:number;body:number;}>/type',
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
  refVal8.schema = {
    "properties": {
      "fontFamily": {
        "$ref": "#/definitions/RecursivePartial<{default:string;}>"
      },
      "fontSize": {
        "$ref": "#/definitions/RecursivePartial<{base:number;remBase:number;body:number;}>"
      }
    },
    "type": "object"
  };
  refVal8.errors = null;
  refVal[8] = refVal8;
  var refVal9 = {
    "properties": {
      "default": {
        "type": "string"
      }
    },
    "type": "object"
  };
  refVal[9] = refVal9;
  var refVal10 = {
    "properties": {
      "base": {
        "type": "number"
      },
      "body": {
        "type": "number"
      },
      "remBase": {
        "type": "number"
      }
    },
    "type": "object"
  };
  refVal[10] = refVal10;
  return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
    'use strict';
    var vErrors = null;
    var errors = 0;
    if (rootData === undefined) rootData = data;
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
                                  if (valid1) {
                                    if (data.themeConfig === undefined) {
                                      valid1 = true;
                                    } else {
                                      var errs_1 = errors;
                                      if (!refVal2(data.themeConfig, (dataPath || '') + '.themeConfig', data, 'themeConfig', rootData)) {
                                        if (vErrors === null) vErrors = refVal2.errors;
                                        else vErrors = vErrors.concat(refVal2.errors);
                                        errors = vErrors.length;
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
    "RecursivePartial<{base:number;remBase:number;body:number;}>": {
      "properties": {
        "base": {
          "type": "number"
        },
        "body": {
          "type": "number"
        },
        "remBase": {
          "type": "number"
        }
      },
      "type": "object"
    },
    "RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>": {
      "properties": {
        "bg": {
          "type": "string"
        },
        "black": {
          "type": "string"
        },
        "blue": {
          "type": "string"
        },
        "border": {
          "type": "string"
        },
        "cerise": {
          "type": "string"
        },
        "darkGray": {
          "type": "string"
        },
        "darkPurple": {
          "type": "string"
        },
        "font": {
          "type": "string"
        },
        "gray": {
          "type": "string"
        },
        "green": {
          "type": "string"
        },
        "headerBg": {
          "type": "string"
        },
        "lightGray": {
          "type": "string"
        },
        "lightRed": {
          "type": "string"
        },
        "offBg": {
          "type": "string"
        },
        "offBorder": {
          "type": "string"
        },
        "offFont": {
          "type": "string"
        },
        "orange": {
          "type": "string"
        },
        "primary": {
          "type": "string"
        },
        "red": {
          "type": "string"
        },
        "secondary": {
          "type": "string"
        },
        "white": {
          "type": "string"
        },
        "yellow": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "RecursivePartial<{color:string;opacity:number;}>": {
      "properties": {
        "color": {
          "type": "string"
        },
        "opacity": {
          "type": "number"
        }
      },
      "type": "object"
    },
    "RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>": {
      "properties": {
        "atom": {
          "type": "string"
        },
        "attribute": {
          "type": "string"
        },
        "builtin": {
          "type": "string"
        },
        "comment": {
          "type": "string"
        },
        "cursor": {
          "type": "string"
        },
        "definition": {
          "type": "string"
        },
        "keyword": {
          "type": "string"
        },
        "number": {
          "type": "string"
        },
        "property": {
          "type": "string"
        },
        "punctuation": {
          "type": "string"
        },
        "string": {
          "type": "string"
        },
        "variable": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "RecursivePartial<{default:string;}>": {
      "properties": {
        "default": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "RecursivePartial<{default:string;}>_1": {
      "properties": {
        "default": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "RecursivePartial<{easing:string;colors:{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;};type:{fontSize:{base:number;remBase:number;body:number;};fontFamily:{default:string;};};}&{isSystem:boolean;colors:{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;};shadow:{color:string;opacity:number;};editor:{fontFamily:{default:string;};fontSize:number;colors:{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;};};}>": {
      "properties": {
        "colors": {
          "$ref": "#/definitions/RecursivePartial<{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;}&{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;}>"
        },
        "easing": {
          "type": "string"
        },
        "editor": {
          "$ref": "#/definitions/RecursivePartial<{fontFamily:{default:string;};fontSize:number;colors:{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;};}>"
        },
        "isSystem": {
          "type": "boolean"
        },
        "shadow": {
          "$ref": "#/definitions/RecursivePartial<{color:string;opacity:number;}>"
        },
        "type": {
          "$ref": "#/definitions/RecursivePartial<{fontSize:{base:number;remBase:number;body:number;};fontFamily:{default:string;};}>"
        }
      },
      "type": "object"
    },
    "RecursivePartial<{fontFamily:{default:string;};fontSize:number;colors:{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;};}>": {
      "properties": {
        "colors": {
          "$ref": "#/definitions/RecursivePartial<{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;}>"
        },
        "fontFamily": {
          "$ref": "#/definitions/RecursivePartial<{default:string;}>_1"
        },
        "fontSize": {
          "type": "number"
        }
      },
      "type": "object"
    },
    "RecursivePartial<{fontSize:{base:number;remBase:number;body:number;};fontFamily:{default:string;};}>": {
      "properties": {
        "fontFamily": {
          "$ref": "#/definitions/RecursivePartial<{default:string;}>"
        },
        "fontSize": {
          "$ref": "#/definitions/RecursivePartial<{base:number;remBase:number;body:number;}>"
        }
      },
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
      "$ref": "#/definitions/RecursivePartial<{easing:string;colors:{black:string;darkGray:string;gray:string;lightGray:string;white:string;green:string;blue:string;cerise:string;red:string;orange:string;yellow:string;lightRed:string;darkPurple:string;};type:{fontSize:{base:number;remBase:number;body:number;};fontFamily:{default:string;};};}&{isSystem:boolean;colors:{primary:string;secondary:string;bg:string;offBg:string;font:string;offFont:string;border:string;offBorder:string;headerBg:string;};shadow:{color:string;opacity:number;};editor:{fontFamily:{default:string;};fontSize:number;colors:{comment:string;string:string;number:string;variable:string;keyword:string;atom:string;attribute:string;property:string;punctuation:string;definition:string;builtin:string;cursor:string;};};}>",
      "description": "Theme config object"
    }
  },
  "type": "object"
};
validate.errors = null;
module.exports = validate;