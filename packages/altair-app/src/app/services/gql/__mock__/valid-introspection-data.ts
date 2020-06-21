const data = {
  __schema: {
    queryType: {
      name: 'Query'
    },
    mutationType: {
      name: 'Mutation'
    },
    subscriptionType: {
      name: 'Subscription'
    },
    types: [
      {
        kind: 'OBJECT',
        name: 'Query',
        description: '',
        fields: [
          {
            name: 'hello',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'bye',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'Boolean',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'GOTCharacters',
            description: '',
            args: [
              {
                name: 'name',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'String',
                  ofType: null
                },
                defaultValue: null
              },
              {
                name: 'gender',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'String',
                  ofType: null
                },
                defaultValue: null
              },
              {
                name: 'culture',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'String',
                  ofType: null
                },
                defaultValue: null
              },
              {
                name: 'born',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'String',
                  ofType: null
                },
                defaultValue: null
              },
              {
                name: 'died',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'String',
                  ofType: null
                },
                defaultValue: null
              },
              {
                name: 'isAlive',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'Boolean',
                  ofType: null
                },
                defaultValue: null
              }
            ],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: 'GOTCharacter',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'GOTBooks',
            description: '',
            args: [
              {
                name: 'name',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'String',
                  ofType: null
                },
                defaultValue: null
              }
            ],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: 'GOTBook',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'GOTHouses',
            description: '',
            args: [
              {
                name: 'name',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'String',
                  ofType: null
                },
                defaultValue: null
              }
            ],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: 'GOTHouse',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'HNUser',
            description: '',
            args: [
              {
                name: 'username',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'String',
                  ofType: null
                },
                defaultValue: null
              }
            ],
            type: {
              kind: 'OBJECT',
              name: 'HNUser',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'files',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: 'File',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'SCALAR',
        name: 'String',
        description: 'The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.',
        fields: null,
        inputFields: null,
        interfaces: null,
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'SCALAR',
        name: 'Boolean',
        description: 'The `Boolean` scalar type represents `true` or `false`.',
        fields: null,
        inputFields: null,
        interfaces: null,
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: 'GOTCharacter',
        description: 'ID as MongoDB ObjectId\n\n## Test Heading\n**bold**\n- list1\n- list2',
        fields: [
          {
            name: 'id',
            description: '',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'Int',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'url',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'name',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'gender',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'culture',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'born',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'died',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'titles',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'aliases',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'father',
            description: '',
            args: [],
            type: {
              kind: 'OBJECT',
              name: 'GOTCharacter',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'mother',
            description: '',
            args: [],
            type: {
              kind: 'OBJECT',
              name: 'GOTCharacter',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'spouse',
            description: '',
            args: [],
            type: {
              kind: 'OBJECT',
              name: 'GOTCharacter',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'allegiances',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'books',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'playedBy',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'SCALAR',
        name: 'Int',
        description: 'The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. ',
        fields: null,
        inputFields: null,
        interfaces: null,
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: 'GOTBook',
        description: 'A Game of Thrones Book\n\n### Real books\n\n- First item\n- Second item\n- Third item\n- Fourth item',
        fields: [
          {
            name: 'id',
            description: '',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'Int',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'url',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'name',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'authors',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'characters',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: 'GOTCharacter',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'released',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: 'GOTHouse',
        description: '',
        fields: [
          {
            name: 'id',
            description: '',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'Int',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'url',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'name',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'region',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'titles',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'seats',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'words',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'overlord',
            description: '',
            args: [],
            type: {
              kind: 'OBJECT',
              name: 'GOTHouse',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'swornMembers',
            description: '',
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: 'GOTCharacter',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: 'HNUser',
        description: '',
        fields: [
          {
            name: 'id',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'karma',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'Int',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'bio',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: 'File',
        description: 'File **files** `file?`',
        fields: [
          {
            name: 'filename',
            description: '',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'mimetype',
            description: '',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'encoding',
            description: '',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'filepath',
            description: '',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: 'Mutation',
        description: '',
        fields: [
          {
            name: 'addMessage',
            description: '',
            args: [
              {
                name: 'content',
                description: '',
                type: {
                  kind: 'SCALAR',
                  name: 'String',
                  ofType: null
                },
                defaultValue: null
              }
            ],
            type: {
              kind: 'OBJECT',
              name: 'Message',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'singleUpload',
            description: '',
            args: [
              {
                name: 'file',
                description: '',
                type: {
                  kind: 'NON_NULL',
                  name: null,
                  ofType: {
                    kind: 'SCALAR',
                    name: 'Upload',
                    ofType: null
                  }
                },
                defaultValue: null
              }
            ],
            type: {
              kind: 'OBJECT',
              name: 'File',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'multipleUploads',
            description: '',
            args: [
              {
                name: 'files',
                description: '',
                type: {
                  kind: 'NON_NULL',
                  name: null,
                  ofType: {
                    kind: 'LIST',
                    name: null,
                    ofType: {
                      kind: 'NON_NULL',
                      name: null,
                      ofType: {
                        kind: 'SCALAR',
                        name: 'Upload',
                        ofType: null
                      }
                    }
                  }
                },
                defaultValue: null
              }
            ],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: 'File',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: 'Message',
        description: '',
        fields: [
          {
            name: 'id',
            description: '',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'Int',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'content',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'author',
            description: '',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'SCALAR',
        name: 'Upload',
        description: 'The `Upload` scalar type represents a file upload.',
        fields: null,
        inputFields: null,
        interfaces: null,
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: 'Subscription',
        description: '',
        fields: [
          {
            name: 'messageAdded',
            description: '',
            args: [],
            type: {
              kind: 'OBJECT',
              name: 'Message',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: '__Schema',
        description: 'A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations.',
        fields: [
          {
            name: 'types',
            description: 'A list of all types supported by this server.',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'LIST',
                name: null,
                ofType: {
                  kind: 'NON_NULL',
                  name: null,
                  ofType: {
                    kind: 'OBJECT',
                    name: '__Type',
                    ofType: null
                  }
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'queryType',
            description: 'The type that query operations will be rooted at.',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: '__Type',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'mutationType',
            description: 'If this server supports mutation, the type that mutation operations will be rooted at.',
            args: [],
            type: {
              kind: 'OBJECT',
              name: '__Type',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'subscriptionType',
            description: 'If this server support subscription, the type that subscription operations will be rooted at.',
            args: [],
            type: {
              kind: 'OBJECT',
              name: '__Type',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'directives',
            description: 'A list of all directives supported by this server.',
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'LIST',
                name: null,
                ofType: {
                  kind: 'NON_NULL',
                  name: null,
                  ofType: {
                    kind: 'OBJECT',
                    name: '__Directive',
                    ofType: null
                  }
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: '__Type',
        description: 'The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.\n\nDepending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name and description, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.',
        fields: [
          {
            name: 'kind',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'ENUM',
                name: '__TypeKind',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'name',
            description: null,
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'description',
            description: null,
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'fields',
            description: null,
            args: [
              {
                name: 'includeDeprecated',
                description: null,
                type: {
                  kind: 'SCALAR',
                  name: 'Boolean',
                  ofType: null
                },
                defaultValue: 'false'
              }
            ],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'NON_NULL',
                name: null,
                ofType: {
                  kind: 'OBJECT',
                  name: '__Field',
                  ofType: null
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'interfaces',
            description: null,
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'NON_NULL',
                name: null,
                ofType: {
                  kind: 'OBJECT',
                  name: '__Type',
                  ofType: null
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'possibleTypes',
            description: null,
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'NON_NULL',
                name: null,
                ofType: {
                  kind: 'OBJECT',
                  name: '__Type',
                  ofType: null
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'enumValues',
            description: null,
            args: [
              {
                name: 'includeDeprecated',
                description: null,
                type: {
                  kind: 'SCALAR',
                  name: 'Boolean',
                  ofType: null
                },
                defaultValue: 'false'
              }
            ],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'NON_NULL',
                name: null,
                ofType: {
                  kind: 'OBJECT',
                  name: '__EnumValue',
                  ofType: null
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'inputFields',
            description: null,
            args: [],
            type: {
              kind: 'LIST',
              name: null,
              ofType: {
                kind: 'NON_NULL',
                name: null,
                ofType: {
                  kind: 'OBJECT',
                  name: '__InputValue',
                  ofType: null
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'ofType',
            description: null,
            args: [],
            type: {
              kind: 'OBJECT',
              name: '__Type',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'ENUM',
        name: '__TypeKind',
        description: 'An enum describing what kind of type a given `__Type` is.',
        fields: null,
        inputFields: null,
        interfaces: null,
        enumValues: [
          {
            name: 'SCALAR',
            description: 'Indicates this type is a scalar.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'OBJECT',
            description: 'Indicates this type is an object. `fields` and `interfaces` are valid fields.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'INTERFACE',
            description: 'Indicates this type is an interface. `fields` and `possibleTypes` are valid fields.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'UNION',
            description: 'Indicates this type is a union. `possibleTypes` is a valid field.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'ENUM',
            description: 'Indicates this type is an enum. `enumValues` is a valid field.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'INPUT_OBJECT',
            description: 'Indicates this type is an input object. `inputFields` is a valid field.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'LIST',
            description: 'Indicates this type is a list. `ofType` is a valid field.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'NON_NULL',
            description: 'Indicates this type is a non-null. `ofType` is a valid field.',
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: '__Field',
        description: 'Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type.',
        fields: [
          {
            name: 'name',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'description',
            description: null,
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'args',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'LIST',
                name: null,
                ofType: {
                  kind: 'NON_NULL',
                  name: null,
                  ofType: {
                    kind: 'OBJECT',
                    name: '__InputValue',
                    ofType: null
                  }
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'type',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: '__Type',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'isDeprecated',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'Boolean',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'deprecationReason',
            description: null,
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: '__InputValue',
        description: 'Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value.',
        fields: [
          {
            name: 'name',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'description',
            description: null,
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'type',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'OBJECT',
                name: '__Type',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'defaultValue',
            description: 'A GraphQL-formatted string representing the default value for this input value.',
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: '__EnumValue',
        description: 'One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string.',
        fields: [
          {
            name: 'name',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'description',
            description: null,
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'isDeprecated',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'Boolean',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'deprecationReason',
            description: null,
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'OBJECT',
        name: '__Directive',
        description: 'A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.\n\nIn some cases, you need to provide options to alter GraphQL\'s execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.',
        fields: [
          {
            name: 'name',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'String',
                ofType: null
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'description',
            description: null,
            args: [],
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'locations',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'LIST',
                name: null,
                ofType: {
                  kind: 'NON_NULL',
                  name: null,
                  ofType: {
                    kind: 'ENUM',
                    name: '__DirectiveLocation',
                    ofType: null
                  }
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'args',
            description: null,
            args: [],
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'LIST',
                name: null,
                ofType: {
                  kind: 'NON_NULL',
                  name: null,
                  ofType: {
                    kind: 'OBJECT',
                    name: '__InputValue',
                    ofType: null
                  }
                }
              }
            },
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        inputFields: null,
        interfaces: [],
        enumValues: null,
        possibleTypes: null
      },
      {
        kind: 'ENUM',
        name: '__DirectiveLocation',
        description: 'A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies.',
        fields: null,
        inputFields: null,
        interfaces: null,
        enumValues: [
          {
            name: 'QUERY',
            description: 'Location adjacent to a query operation.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'MUTATION',
            description: 'Location adjacent to a mutation operation.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'SUBSCRIPTION',
            description: 'Location adjacent to a subscription operation.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'FIELD',
            description: 'Location adjacent to a field.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'FRAGMENT_DEFINITION',
            description: 'Location adjacent to a fragment definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'FRAGMENT_SPREAD',
            description: 'Location adjacent to a fragment spread.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'INLINE_FRAGMENT',
            description: 'Location adjacent to an inline fragment.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'VARIABLE_DEFINITION',
            description: 'Location adjacent to a variable definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'SCHEMA',
            description: 'Location adjacent to a schema definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'SCALAR',
            description: 'Location adjacent to a scalar definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'OBJECT',
            description: 'Location adjacent to an object type definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'FIELD_DEFINITION',
            description: 'Location adjacent to a field definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'ARGUMENT_DEFINITION',
            description: 'Location adjacent to an argument definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'INTERFACE',
            description: 'Location adjacent to an interface definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'UNION',
            description: 'Location adjacent to a union definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'ENUM',
            description: 'Location adjacent to an enum definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'ENUM_VALUE',
            description: 'Location adjacent to an enum value definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'INPUT_OBJECT',
            description: 'Location adjacent to an input object type definition.',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'INPUT_FIELD_DEFINITION',
            description: 'Location adjacent to an input object field definition.',
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        possibleTypes: null
      },
      {
        kind: 'ENUM',
        name: 'CacheControlScope',
        description: '',
        fields: null,
        inputFields: null,
        interfaces: null,
        enumValues: [
          {
            name: 'PUBLIC',
            description: '',
            isDeprecated: false,
            deprecationReason: null
          },
          {
            name: 'PRIVATE',
            description: '',
            isDeprecated: false,
            deprecationReason: null
          }
        ],
        possibleTypes: null
      }
    ],
    directives: [
      {
        name: 'cacheControl',
        description: '',
        locations: [
          'FIELD_DEFINITION',
          'OBJECT',
          'INTERFACE'
        ],
        args: [
          {
            name: 'maxAge',
            description: '',
            type: {
              kind: 'SCALAR',
              name: 'Int',
              ofType: null
            },
            defaultValue: null
          },
          {
            name: 'scope',
            description: '',
            type: {
              kind: 'ENUM',
              name: 'CacheControlScope',
              ofType: null
            },
            defaultValue: null
          }
        ]
      },
      {
        name: 'skip',
        description: 'Directs the executor to skip this field or fragment when the `if` argument is true.',
        locations: [
          'FIELD',
          'FRAGMENT_SPREAD',
          'INLINE_FRAGMENT'
        ],
        args: [
          {
            name: 'if',
            description: 'Skipped when true.',
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'Boolean',
                ofType: null
              }
            },
            defaultValue: null
          }
        ]
      },
      {
        name: 'include',
        description: 'Directs the executor to include this field or fragment only when the `if` argument is true.',
        locations: [
          'FIELD',
          'FRAGMENT_SPREAD',
          'INLINE_FRAGMENT'
        ],
        args: [
          {
            name: 'if',
            description: 'Included when true.',
            type: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'SCALAR',
                name: 'Boolean',
                ofType: null
              }
            },
            defaultValue: null
          }
        ]
      },
      {
        name: 'deprecated',
        description: 'Marks an element of a GraphQL schema as no longer supported.',
        locations: [
          'FIELD_DEFINITION',
          'ENUM_VALUE'
        ],
        args: [
          {
            name: 'reason',
            description: 'Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/).',
            type: {
              kind: 'SCALAR',
              name: 'String',
              ofType: null
            },
            defaultValue: '"No longer supported"'
          }
        ]
      }
    ]
  }
};

export default data;
