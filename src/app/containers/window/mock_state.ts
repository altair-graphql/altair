export const mockState = {
  "windows": {
    "75595758-0cd8-4824-ac9b-c88b95d4b531": {
      "layout": {
        "isLoading": false,
        "title": "Window 1"
      },
      "query": {
        "url": "http://localhost:4000/graphql",
        "subscriptionUrl": "",
        "query": "\nquery X{\n  field{\n    name\n    number\n  }\n}\n\nquery Z {\n  field{\n    number\n  }\n}",
        "httpVerb": "GET",
        "response": {
          "data": {
            "field": {
              "name": "Hello World",
              "number": -75
            }
          }
        },
        "responseTime": 41,
        "responseStatus": 200,
        "responseStatusText": "OK",
        "showUrlAlert": false,
        "urlAlertMessage": "URL has been set",
        "urlAlertSuccess": true,
        "showEditorAlert": false,
        "editorAlertMessage": "Query is set",
        "editorAlertSuccess": true,
        "subscriptionClient": null,
        "isSubscribed": false,
        "subscriptionResponseList": [],
        "operations": [{
            "kind": "OperationDefinition",
            "operation": "query",
            "name": {
              "kind": "Name",
              "value": "X",
              "loc": {
                "start": 7,
                "end": 8
              }
            },
            "variableDefinitions": [],
            "directives": [],
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "field",
                  "loc": {
                    "start": 12,
                    "end": 17
                  }
                },
                "arguments": [],
                "directives": [],
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                      "kind": "Field",
                      "name": {
                        "kind": "Name",
                        "value": "name",
                        "loc": {
                          "start": 23,
                          "end": 27
                        }
                      },
                      "arguments": [],
                      "directives": [],
                      "loc": {
                        "start": 23,
                        "end": 27
                      }
                    },
                    {
                      "kind": "Field",
                      "name": {
                        "kind": "Name",
                        "value": "number",
                        "loc": {
                          "start": 32,
                          "end": 38
                        }
                      },
                      "arguments": [],
                      "directives": [],
                      "loc": {
                        "start": 32,
                        "end": 38
                      }
                    }
                  ],
                  "loc": {
                    "start": 17,
                    "end": 42
                  }
                },
                "loc": {
                  "start": 12,
                  "end": 42
                }
              }],
              "loc": {
                "start": 8,
                "end": 44
              }
            },
            "loc": {
              "start": 1,
              "end": 44
            }
          },
          {
            "kind": "OperationDefinition",
            "operation": "query",
            "name": {
              "kind": "Name",
              "value": "Z",
              "loc": {
                "start": 52,
                "end": 53
              }
            },
            "variableDefinitions": [],
            "directives": [],
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "field",
                  "loc": {
                    "start": 58,
                    "end": 63
                  }
                },
                "arguments": [],
                "directives": [],
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{
                    "kind": "Field",
                    "name": {
                      "kind": "Name",
                      "value": "number",
                      "loc": {
                        "start": 69,
                        "end": 75
                      }
                    },
                    "arguments": [],
                    "directives": [],
                    "loc": {
                      "start": 69,
                      "end": 75
                    }
                  }],
                  "loc": {
                    "start": 63,
                    "end": 79
                  }
                },
                "loc": {
                  "start": 58,
                  "end": 79
                }
              }],
              "loc": {
                "start": 54,
                "end": 81
              }
            },
            "loc": {
              "start": 46,
              "end": 81
            }
          }
        ],
        "selectedOperation": "X"
      },
      "headers": [{
          "key": "",
          "value": ""
        },
        {
          "key": "",
          "value": ""
        },
        {
          "key": "",
          "value": ""
        }
      ],
      "variables": {
        "variables": "{}"
      },
      "dialogs": {
        "showHeaderDialog": false,
        "showVariableDialog": false,
        "showSubscriptionUrlDialog": false,
        "showHistoryDialog": false
      },
      "schema": {
        "introspection": {
          "__schema": {
            "queryType": {
              "name": "Query"
            },
            "mutationType": null,
            "subscriptionType": null,
            "types": [{
                "kind": "OBJECT",
                "name": "Query",
                "description": "",
                "fields": [{
                  "name": "field",
                  "description": "",
                  "args": [],
                  "type": {
                    "kind": "INTERFACE",
                    "name": "ParentInterface",
                    "ofType": null
                  },
                  "isDeprecated": false,
                  "deprecationReason": null
                }],
                "inputFields": null,
                "interfaces": [],
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "INTERFACE",
                "name": "ParentInterface",
                "description": "",
                "fields": [{
                    "name": "name",
                    "description": "",
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "number",
                    "description": "",
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "Int",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "inputFields": null,
                "interfaces": null,
                "enumValues": null,
                "possibleTypes": [{
                    "kind": "OBJECT",
                    "name": "A",
                    "ofType": null
                  },
                  {
                    "kind": "OBJECT",
                    "name": "B",
                    "ofType": null
                  }
                ]
              },
              {
                "kind": "SCALAR",
                "name": "String",
                "description": "The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.",
                "fields": null,
                "inputFields": null,
                "interfaces": null,
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "SCALAR",
                "name": "Int",
                "description": "The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. ",
                "fields": null,
                "inputFields": null,
                "interfaces": null,
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "OBJECT",
                "name": "__Schema",
                "description": "A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations.",
                "fields": [{
                    "name": "types",
                    "description": "A list of all types supported by this server.",
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "LIST",
                        "name": null,
                        "ofType": {
                          "kind": "NON_NULL",
                          "name": null,
                          "ofType": {
                            "kind": "OBJECT",
                            "name": "__Type",
                            "ofType": null
                          }
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "queryType",
                    "description": "The type that query operations will be rooted at.",
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "OBJECT",
                        "name": "__Type",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "mutationType",
                    "description": "If this server supports mutation, the type that mutation operations will be rooted at.",
                    "args": [],
                    "type": {
                      "kind": "OBJECT",
                      "name": "__Type",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "subscriptionType",
                    "description": "If this server support subscription, the type that subscription operations will be rooted at.",
                    "args": [],
                    "type": {
                      "kind": "OBJECT",
                      "name": "__Type",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "directives",
                    "description": "A list of all directives supported by this server.",
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "LIST",
                        "name": null,
                        "ofType": {
                          "kind": "NON_NULL",
                          "name": null,
                          "ofType": {
                            "kind": "OBJECT",
                            "name": "__Directive",
                            "ofType": null
                          }
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "inputFields": null,
                "interfaces": [],
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "OBJECT",
                "name": "__Type",
                "description": "The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.\n\nDepending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name and description, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.",
                "fields": [{
                    "name": "kind",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "ENUM",
                        "name": "__TypeKind",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "name",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "description",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "fields",
                    "description": null,
                    "args": [{
                      "name": "includeDeprecated",
                      "description": null,
                      "type": {
                        "kind": "SCALAR",
                        "name": "Boolean",
                        "ofType": null
                      },
                      "defaultValue": "false"
                    }],
                    "type": {
                      "kind": "LIST",
                      "name": null,
                      "ofType": {
                        "kind": "NON_NULL",
                        "name": null,
                        "ofType": {
                          "kind": "OBJECT",
                          "name": "__Field",
                          "ofType": null
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "interfaces",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "LIST",
                      "name": null,
                      "ofType": {
                        "kind": "NON_NULL",
                        "name": null,
                        "ofType": {
                          "kind": "OBJECT",
                          "name": "__Type",
                          "ofType": null
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "possibleTypes",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "LIST",
                      "name": null,
                      "ofType": {
                        "kind": "NON_NULL",
                        "name": null,
                        "ofType": {
                          "kind": "OBJECT",
                          "name": "__Type",
                          "ofType": null
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "enumValues",
                    "description": null,
                    "args": [{
                      "name": "includeDeprecated",
                      "description": null,
                      "type": {
                        "kind": "SCALAR",
                        "name": "Boolean",
                        "ofType": null
                      },
                      "defaultValue": "false"
                    }],
                    "type": {
                      "kind": "LIST",
                      "name": null,
                      "ofType": {
                        "kind": "NON_NULL",
                        "name": null,
                        "ofType": {
                          "kind": "OBJECT",
                          "name": "__EnumValue",
                          "ofType": null
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "inputFields",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "LIST",
                      "name": null,
                      "ofType": {
                        "kind": "NON_NULL",
                        "name": null,
                        "ofType": {
                          "kind": "OBJECT",
                          "name": "__InputValue",
                          "ofType": null
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "ofType",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "OBJECT",
                      "name": "__Type",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "inputFields": null,
                "interfaces": [],
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "ENUM",
                "name": "__TypeKind",
                "description": "An enum describing what kind of type a given `__Type` is.",
                "fields": null,
                "inputFields": null,
                "interfaces": null,
                "enumValues": [{
                    "name": "SCALAR",
                    "description": "Indicates this type is a scalar.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "OBJECT",
                    "description": "Indicates this type is an object. `fields` and `interfaces` are valid fields.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "INTERFACE",
                    "description": "Indicates this type is an interface. `fields` and `possibleTypes` are valid fields.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "UNION",
                    "description": "Indicates this type is a union. `possibleTypes` is a valid field.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "ENUM",
                    "description": "Indicates this type is an enum. `enumValues` is a valid field.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "INPUT_OBJECT",
                    "description": "Indicates this type is an input object. `inputFields` is a valid field.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "LIST",
                    "description": "Indicates this type is a list. `ofType` is a valid field.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "NON_NULL",
                    "description": "Indicates this type is a non-null. `ofType` is a valid field.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "possibleTypes": null
              },
              {
                "kind": "SCALAR",
                "name": "Boolean",
                "description": "The `Boolean` scalar type represents `true` or `false`.",
                "fields": null,
                "inputFields": null,
                "interfaces": null,
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "OBJECT",
                "name": "__Field",
                "description": "Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type.",
                "fields": [{
                    "name": "name",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "String",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "description",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "args",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "LIST",
                        "name": null,
                        "ofType": {
                          "kind": "NON_NULL",
                          "name": null,
                          "ofType": {
                            "kind": "OBJECT",
                            "name": "__InputValue",
                            "ofType": null
                          }
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "type",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "OBJECT",
                        "name": "__Type",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "isDeprecated",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "Boolean",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "deprecationReason",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "inputFields": null,
                "interfaces": [],
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "OBJECT",
                "name": "__InputValue",
                "description": "Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value.",
                "fields": [{
                    "name": "name",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "String",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "description",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "type",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "OBJECT",
                        "name": "__Type",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "defaultValue",
                    "description": "A GraphQL-formatted string representing the default value for this input value.",
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "inputFields": null,
                "interfaces": [],
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "OBJECT",
                "name": "__EnumValue",
                "description": "One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string.",
                "fields": [{
                    "name": "name",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "String",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "description",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "isDeprecated",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "Boolean",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "deprecationReason",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "inputFields": null,
                "interfaces": [],
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "OBJECT",
                "name": "__Directive",
                "description": "A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.\n\nIn some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.",
                "fields": [{
                    "name": "name",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "String",
                        "ofType": null
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "description",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "locations",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "LIST",
                        "name": null,
                        "ofType": {
                          "kind": "NON_NULL",
                          "name": null,
                          "ofType": {
                            "kind": "ENUM",
                            "name": "__DirectiveLocation",
                            "ofType": null
                          }
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "args",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "LIST",
                        "name": null,
                        "ofType": {
                          "kind": "NON_NULL",
                          "name": null,
                          "ofType": {
                            "kind": "OBJECT",
                            "name": "__InputValue",
                            "ofType": null
                          }
                        }
                      }
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "onOperation",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "Boolean",
                        "ofType": null
                      }
                    },
                    "isDeprecated": true,
                    "deprecationReason": "Use `locations`."
                  },
                  {
                    "name": "onFragment",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "Boolean",
                        "ofType": null
                      }
                    },
                    "isDeprecated": true,
                    "deprecationReason": "Use `locations`."
                  },
                  {
                    "name": "onField",
                    "description": null,
                    "args": [],
                    "type": {
                      "kind": "NON_NULL",
                      "name": null,
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "Boolean",
                        "ofType": null
                      }
                    },
                    "isDeprecated": true,
                    "deprecationReason": "Use `locations`."
                  }
                ],
                "inputFields": null,
                "interfaces": [],
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "ENUM",
                "name": "__DirectiveLocation",
                "description": "A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies.",
                "fields": null,
                "inputFields": null,
                "interfaces": null,
                "enumValues": [{
                    "name": "QUERY",
                    "description": "Location adjacent to a query operation.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "MUTATION",
                    "description": "Location adjacent to a mutation operation.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "SUBSCRIPTION",
                    "description": "Location adjacent to a subscription operation.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "FIELD",
                    "description": "Location adjacent to a field.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "FRAGMENT_DEFINITION",
                    "description": "Location adjacent to a fragment definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "FRAGMENT_SPREAD",
                    "description": "Location adjacent to a fragment spread.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "INLINE_FRAGMENT",
                    "description": "Location adjacent to an inline fragment.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "SCHEMA",
                    "description": "Location adjacent to a schema definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "SCALAR",
                    "description": "Location adjacent to a scalar definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "OBJECT",
                    "description": "Location adjacent to an object type definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "FIELD_DEFINITION",
                    "description": "Location adjacent to a field definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "ARGUMENT_DEFINITION",
                    "description": "Location adjacent to an argument definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "INTERFACE",
                    "description": "Location adjacent to an interface definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "UNION",
                    "description": "Location adjacent to a union definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "ENUM",
                    "description": "Location adjacent to an enum definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "ENUM_VALUE",
                    "description": "Location adjacent to an enum value definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "INPUT_OBJECT",
                    "description": "Location adjacent to an input object type definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "INPUT_FIELD_DEFINITION",
                    "description": "Location adjacent to an input object field definition.",
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "possibleTypes": null
              },
              {
                "kind": "OBJECT",
                "name": "A",
                "description": "",
                "fields": [{
                    "name": "name",
                    "description": "",
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "number",
                    "description": "",
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "Int",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "otherName",
                    "description": "",
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "inputFields": null,
                "interfaces": [{
                  "kind": "INTERFACE",
                  "name": "ParentInterface",
                  "ofType": null
                }],
                "enumValues": null,
                "possibleTypes": null
              },
              {
                "kind": "OBJECT",
                "name": "B",
                "description": "",
                "fields": [{
                    "name": "name",
                    "description": "",
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "number",
                    "description": "",
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "Int",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  },
                  {
                    "name": "yetAnotherName",
                    "description": "",
                    "args": [],
                    "type": {
                      "kind": "SCALAR",
                      "name": "String",
                      "ofType": null
                    },
                    "isDeprecated": false,
                    "deprecationReason": null
                  }
                ],
                "inputFields": null,
                "interfaces": [{
                  "kind": "INTERFACE",
                  "name": "ParentInterface",
                  "ofType": null
                }],
                "enumValues": null,
                "possibleTypes": null
              }
            ],
            "directives": [{
                "name": "skip",
                "description": "Directs the executor to skip this field or fragment when the `if` argument is true.",
                "locations": [
                  "FIELD",
                  "FRAGMENT_SPREAD",
                  "INLINE_FRAGMENT"
                ],
                "args": [{
                  "name": "if",
                  "description": "Skipped when true.",
                  "type": {
                    "kind": "NON_NULL",
                    "name": null,
                    "ofType": {
                      "kind": "SCALAR",
                      "name": "Boolean",
                      "ofType": null
                    }
                  },
                  "defaultValue": null
                }]
              },
              {
                "name": "include",
                "description": "Directs the executor to include this field or fragment only when the `if` argument is true.",
                "locations": [
                  "FIELD",
                  "FRAGMENT_SPREAD",
                  "INLINE_FRAGMENT"
                ],
                "args": [{
                  "name": "if",
                  "description": "Included when true.",
                  "type": {
                    "kind": "NON_NULL",
                    "name": null,
                    "ofType": {
                      "kind": "SCALAR",
                      "name": "Boolean",
                      "ofType": null
                    }
                  },
                  "defaultValue": null
                }]
              },
              {
                "name": "deprecated",
                "description": "Marks an element of a GraphQL schema as no longer supported.",
                "locations": [
                  "FIELD_DEFINITION",
                  "ENUM_VALUE"
                ],
                "args": [{
                  "name": "reason",
                  "description": "Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted in [Markdown](https://daringfireball.net/projects/markdown/).",
                  "type": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  },
                  "defaultValue": "\"No longer supported\""
                }]
              }
            ]
          }
        },
        "schema": {
          "_queryType": "Query",
          "_mutationType": null,
          "_subscriptionType": null,
          "_directives": [{
              "name": "skip",
              "description": "Directs the executor to skip this field or fragment when the `if` argument is true.",
              "locations": [
                "FIELD",
                "FRAGMENT_SPREAD",
                "INLINE_FRAGMENT"
              ],
              "args": [{
                "name": "if",
                "description": "Skipped when true.",
                "type": "Boolean!"
              }]
            },
            {
              "name": "include",
              "description": "Directs the executor to include this field or fragment only when the `if` argument is true.",
              "locations": [
                "FIELD",
                "FRAGMENT_SPREAD",
                "INLINE_FRAGMENT"
              ],
              "args": [{
                "name": "if",
                "description": "Included when true.",
                "type": "Boolean!"
              }]
            },
            {
              "name": "deprecated",
              "description": "Marks an element of a GraphQL schema as no longer supported.",
              "locations": [
                "FIELD_DEFINITION",
                "ENUM_VALUE"
              ],
              "args": [{
                "name": "reason",
                "description": "Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted in [Markdown](https://daringfireball.net/projects/markdown/).",
                "type": "String",
                "defaultValue": "No longer supported"
              }]
            }
          ],
          "_typeMap": {
            "Query": "Query",
            "ParentInterface": "ParentInterface",
            "String": "String",
            "Int": "Int",
            "__Schema": "__Schema",
            "__Type": "__Type",
            "__TypeKind": "__TypeKind",
            "Boolean": "Boolean",
            "__Field": "__Field",
            "__InputValue": "__InputValue",
            "__EnumValue": "__EnumValue",
            "__Directive": "__Directive",
            "__DirectiveLocation": "__DirectiveLocation",
            "A": "A",
            "B": "B"
          },
          "_implementations": {
            "ParentInterface": [
              "A",
              "B"
            ]
          }
        },
        "allowIntrospection": true
      },
      "docs": {
        "showDocs": true,
        "isLoading": false
      },
      "history": {
        "list": [{
            "query": "\nquery X{\n  field{\n    name\n    number\n  }\n}\n\nquery Z {\n  field{\n    number\n  }\n}"
          },
          {
            "query": "\nquery {\n  field{\n    name\n    number\n  }\n}\n"
          },
          {
            "query": "\nquery Ab{\n  field{\n    name\n    number\n  }\n}\n\nquery xBCd{\n  field{\n    name\n  }\n}"
          },
          {
            "query": "\nquery Ab{\n  field{\n    name\n    number\n  }\n}\n\nquery xBC{\n  field{\n    name\n  }\n}"
          },
          {
            "query": "\nquery A{\n  field{\n    name\n    number\n  }\n}\n\nquery xB{\n  field{\n    name\n  }\n}"
          },
          {
            "query": "\nquery{\n  field{\n    name\n    number\n  }\n}\n\nquery x{\n  field{\n    name\n  }\n}"
          },
          {
            "query": "\nquery{\n  field{\n    name\n    number\n  }\n}\n\nquery{\n  field{\n    name\n  }\n}"
          }
        ]
      },
      "windowId": "75595758-0cd8-4824-ac9b-c88b95d4b531"
    }
  },
  "windowsMeta": {
    "activeWindowId": "75595758-0cd8-4824-ac9b-c88b95d4b531",
    "windowIds": [
      "75595758-0cd8-4824-ac9b-c88b95d4b531"
    ]
  },
  "settings": {
    "isShown": false,
    "theme": "light",
    "language": "en",
    "addQueryDepthLimit": 3,
    "tabSize": "2"
  }
}
