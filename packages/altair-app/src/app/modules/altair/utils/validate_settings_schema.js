'use strict';
var validate = (function() {
  var refVal = [];
  var refVal1 = {
    "properties": {
      "closed": {
        "type": "boolean"
      },
      "complete": {
        "type": "object"
      },
      "error": {
        "type": "object"
      },
      "next": {
        "type": "object"
      }
    },
    "type": "object"
  };
  refVal[1] = refVal1;
  var refVal2 = {
    "type": "object"
  };
  refVal[2] = refVal2;
  var refVal3 = (function() {
    return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
      'use strict';
      var vErrors = null;
      var errors = 0;
      if (rootData === undefined) rootData = data;
      if ((data && typeof data === "object" && !Array.isArray(data))) {
        var errs__0 = errors;
        var valid1 = true;
        if (data._isScalar === undefined) {
          valid1 = true;
        } else {
          var errs_1 = errors;
          if (typeof data._isScalar !== "boolean") {
            validate.errors = [{
              keyword: 'type',
              dataPath: (dataPath || '') + '._isScalar',
              schemaPath: '#/properties/_isScalar/type',
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
          var data1 = data.operator;
          if (data1 === undefined) {
            valid1 = true;
          } else {
            var errs_1 = errors;
            var errs_2 = errors;
            if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
              validate.errors = [{
                keyword: 'type',
                dataPath: (dataPath || '') + '.operator',
                schemaPath: '#/definitions/Operator<any,any>/type',
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
            if (data.source === undefined) {
              valid1 = true;
            } else {
              var errs_1 = errors;
              if (!refVal[3](data.source, (dataPath || '') + '.source', data, 'source', rootData)) {
                if (vErrors === null) vErrors = refVal[3].errors;
                else vErrors = vErrors.concat(refVal[3].errors);
                errors = vErrors.length;
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
  refVal3.schema = {
    "description": "A representation of any set of values over any amount of time. This is the most basic building block\nof RxJS.",
    "properties": {
      "_isScalar": {
        "description": "Internal implementation detail, do not use directly.",
        "type": "boolean"
      },
      "operator": {
        "$ref": "#/definitions/Operator<any,any>"
      },
      "source": {
        "$ref": "#/definitions/Observable<any>"
      }
    },
    "type": "object"
  };
  refVal3.errors = null;
  refVal[3] = refVal3;
  return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
    'use strict';
    var vErrors = null;
    var errors = 0;
    if (rootData === undefined) rootData = data;
    if ((data && typeof data === "object" && !Array.isArray(data))) {
      var errs__0 = errors;
      var valid1 = true;
      if (data._isScalar === undefined) {
        valid1 = true;
      } else {
        var errs_1 = errors;
        if (typeof data._isScalar !== "boolean") {
          validate.errors = [{
            keyword: 'type',
            dataPath: (dataPath || '') + '._isScalar',
            schemaPath: '#/properties/_isScalar/type',
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
        if (valid1) {
          if (data.closed === undefined) {
            valid1 = true;
          } else {
            var errs_1 = errors;
            if (typeof data.closed !== "boolean") {
              validate.errors = [{
                keyword: 'type',
                dataPath: (dataPath || '') + '.closed',
                schemaPath: '#/properties/closed/type',
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
            if (data.hasError === undefined) {
              valid1 = true;
            } else {
              var errs_1 = errors;
              if (typeof data.hasError !== "boolean") {
                validate.errors = [{
                  keyword: 'type',
                  dataPath: (dataPath || '') + '.hasError',
                  schemaPath: '#/properties/hasError/type',
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
              if (data.isStopped === undefined) {
                valid1 = true;
              } else {
                var errs_1 = errors;
                if (typeof data.isStopped !== "boolean") {
                  validate.errors = [{
                    keyword: 'type',
                    dataPath: (dataPath || '') + '.isStopped',
                    schemaPath: '#/properties/isStopped/type',
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
                var data1 = data.observers;
                if (data1 === undefined) {
                  valid1 = true;
                } else {
                  var errs_1 = errors;
                  if (Array.isArray(data1)) {
                    var errs__1 = errors;
                    var valid1;
                    for (var i1 = 0; i1 < data1.length; i1++) {
                      var data2 = data1[i1];
                      var errs_2 = errors;
                      var errs_3 = errors;
                      if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                        var errs__3 = errors;
                        var valid4 = true;
                        if (data2.closed === undefined) {
                          valid4 = true;
                        } else {
                          var errs_4 = errors;
                          if (typeof data2.closed !== "boolean") {
                            validate.errors = [{
                              keyword: 'type',
                              dataPath: (dataPath || '') + '.observers[' + i1 + '].closed',
                              schemaPath: '#/definitions/Observer<any>/properties/closed/type',
                              params: {
                                type: 'boolean'
                              },
                              message: 'should be boolean'
                            }];
                            return false;
                          }
                          var valid4 = errors === errs_4;
                        }
                        if (valid4) {
                          var data3 = data2.complete;
                          if (data3 === undefined) {
                            valid4 = true;
                          } else {
                            var errs_4 = errors;
                            if ((!data3 || typeof data3 !== "object" || Array.isArray(data3))) {
                              validate.errors = [{
                                keyword: 'type',
                                dataPath: (dataPath || '') + '.observers[' + i1 + '].complete',
                                schemaPath: '#/definitions/Observer<any>/properties/complete/type',
                                params: {
                                  type: 'object'
                                },
                                message: 'should be object'
                              }];
                              return false;
                            }
                            var valid4 = errors === errs_4;
                          }
                          if (valid4) {
                            var data3 = data2.error;
                            if (data3 === undefined) {
                              valid4 = true;
                            } else {
                              var errs_4 = errors;
                              if ((!data3 || typeof data3 !== "object" || Array.isArray(data3))) {
                                validate.errors = [{
                                  keyword: 'type',
                                  dataPath: (dataPath || '') + '.observers[' + i1 + '].error',
                                  schemaPath: '#/definitions/Observer<any>/properties/error/type',
                                  params: {
                                    type: 'object'
                                  },
                                  message: 'should be object'
                                }];
                                return false;
                              }
                              var valid4 = errors === errs_4;
                            }
                            if (valid4) {
                              var data3 = data2.next;
                              if (data3 === undefined) {
                                valid4 = true;
                              } else {
                                var errs_4 = errors;
                                if ((!data3 || typeof data3 !== "object" || Array.isArray(data3))) {
                                  validate.errors = [{
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.observers[' + i1 + '].next',
                                    schemaPath: '#/definitions/Observer<any>/properties/next/type',
                                    params: {
                                      type: 'object'
                                    },
                                    message: 'should be object'
                                  }];
                                  return false;
                                }
                                var valid4 = errors === errs_4;
                              }
                            }
                          }
                        }
                      } else {
                        validate.errors = [{
                          keyword: 'type',
                          dataPath: (dataPath || '') + '.observers[' + i1 + ']',
                          schemaPath: '#/definitions/Observer<any>/type',
                          params: {
                            type: 'object'
                          },
                          message: 'should be object'
                        }];
                        return false;
                      }
                      var valid3 = errors === errs_3;
                      var valid2 = errors === errs_2;
                      if (!valid2) break;
                    }
                  } else {
                    validate.errors = [{
                      keyword: 'type',
                      dataPath: (dataPath || '') + '.observers',
                      schemaPath: '#/properties/observers/type',
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
                  var data1 = data.operator;
                  if (data1 === undefined) {
                    valid1 = true;
                  } else {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
                      validate.errors = [{
                        keyword: 'type',
                        dataPath: (dataPath || '') + '.operator',
                        schemaPath: '#/definitions/Operator<any,any>/type',
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
                    if (data.source === undefined) {
                      valid1 = true;
                    } else {
                      var errs_1 = errors;
                      if (!refVal3(data.source, (dataPath || '') + '.source', data, 'source', rootData)) {
                        if (vErrors === null) vErrors = refVal3.errors;
                        else vErrors = vErrors.concat(refVal3.errors);
                        errors = vErrors.length;
                      }
                      var valid1 = errors === errs_1;
                    }
                    if (valid1) {
                      if (valid1) {}
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
    "Observable<any>": {
      "description": "A representation of any set of values over any amount of time. This is the most basic building block\nof RxJS.",
      "properties": {
        "_isScalar": {
          "description": "Internal implementation detail, do not use directly.",
          "type": "boolean"
        },
        "operator": {
          "$ref": "#/definitions/Operator<any,any>"
        },
        "source": {
          "$ref": "#/definitions/Observable<any>"
        }
      },
      "type": "object"
    },
    "Observer<any>": {
      "properties": {
        "closed": {
          "type": "boolean"
        },
        "complete": {
          "type": "object"
        },
        "error": {
          "type": "object"
        },
        "next": {
          "type": "object"
        }
      },
      "type": "object"
    },
    "Operator<any,any>": {
      "type": "object"
    }
  },
  "properties": {
    "_isScalar": {
      "description": "Internal implementation detail, do not use directly.",
      "type": "boolean"
    },
    "_value": {},
    "closed": {
      "type": "boolean"
    },
    "hasError": {
      "type": "boolean"
    },
    "isStopped": {
      "type": "boolean"
    },
    "observers": {
      "items": {
        "$ref": "#/definitions/Observer<any>"
      },
      "type": "array"
    },
    "operator": {
      "$ref": "#/definitions/Operator<any,any>"
    },
    "source": {
      "$ref": "#/definitions/Observable<any>"
    },
    "stateSubscription": {},
    "thrownError": {},
    "value": {}
  },
  "type": "object"
};
validate.errors = null;
module.exports = validate;