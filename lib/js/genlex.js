'use strict';

var Char = require("./char.js");
var List = require("./list.js");
var Block = require("./block.js");
var Bytes = require("./bytes.js");
var Stream = require("./stream.js");
var Hashtbl = require("./hashtbl.js");
var Caml_bytes = require("./caml_bytes.js");
var Caml_int32 = require("./caml_int32.js");
var Caml_format = require("./caml_format.js");
var Caml_builtin_exceptions = require("./caml_builtin_exceptions.js");

var initial_buffer = Caml_bytes.caml_create_bytes(32);

var buffer = {
  contents: initial_buffer
};

var bufpos = {
  contents: 0
};

function reset_buffer(param) {
  buffer.contents = initial_buffer;
  bufpos.contents = 0;
  
}

function store(c) {
  if (bufpos.contents >= buffer.contents.length) {
    var newbuffer = Caml_bytes.caml_create_bytes((bufpos.contents << 1));
    Bytes.blit(buffer.contents, 0, newbuffer, 0, bufpos.contents);
    buffer.contents = newbuffer;
  }
  buffer.contents[bufpos.contents] = c;
  bufpos.contents = bufpos.contents + 1 | 0;
  
}

function get_string(param) {
  var s = Bytes.sub_string(buffer.contents, 0, bufpos.contents);
  buffer.contents = initial_buffer;
  return s;
}

function make_lexer(keywords) {
  var kwd_table = Hashtbl.create(undefined, 17);
  List.iter((function (s) {
          return Hashtbl.add(kwd_table, s, /* Kwd */Block.__(0, [s]));
        }), keywords);
  var ident_or_keyword = function (id) {
    try {
      return Hashtbl.find(kwd_table, id);
    }
    catch (exn){
      if (exn === Caml_builtin_exceptions.not_found) {
        return /* Ident */Block.__(1, [id]);
      }
      throw exn;
    }
  };
  var keyword_or_error = function (c) {
    var s = Caml_bytes.bytes_to_string(Bytes.make(1, c));
    try {
      return Hashtbl.find(kwd_table, s);
    }
    catch (exn){
      if (exn === Caml_builtin_exceptions.not_found) {
        throw [
              Stream.$$Error,
              "Illegal character " + s
            ];
      }
      throw exn;
    }
  };
  var next_token = function (strm__) {
    while(true) {
      var match = Stream.peek(strm__);
      if (match === undefined) {
        return ;
      }
      var exit = 0;
      if (match < 124) {
        var switcher = match - 65 | 0;
        if (switcher > 57 || switcher < 0) {
          if (switcher >= 58) {
            exit = 1;
          } else {
            switch (switcher + 65 | 0) {
              case 9 :
              case 10 :
              case 12 :
              case 13 :
              case 26 :
              case 32 :
                  Stream.junk(strm__);
                  continue ;
              case 34 :
                  Stream.junk(strm__);
                  reset_buffer(undefined);
                  return /* String */Block.__(4, [string(strm__)]);
              case 39 :
                  Stream.junk(strm__);
                  var c;
                  try {
                    c = $$char(strm__);
                  }
                  catch (exn){
                    if (exn === Stream.Failure) {
                      throw [
                            Stream.$$Error,
                            ""
                          ];
                    }
                    throw exn;
                  }
                  var match$1 = Stream.peek(strm__);
                  if (match$1 !== undefined) {
                    if (match$1 !== 39) {
                      throw [
                            Stream.$$Error,
                            ""
                          ];
                    }
                    Stream.junk(strm__);
                    return /* Char */Block.__(5, [c]);
                  }
                  throw [
                        Stream.$$Error,
                        ""
                      ];
              case 40 :
                  Stream.junk(strm__);
                  var match$2 = Stream.peek(strm__);
                  if (match$2 === 42) {
                    Stream.junk(strm__);
                    comment(strm__);
                    return next_token(strm__);
                  } else {
                    return keyword_or_error(/* "(" */40);
                  }
              case 45 :
                  Stream.junk(strm__);
                  var match$3 = Stream.peek(strm__);
                  if (match$3 !== undefined && !(match$3 > 57 || match$3 < 48)) {
                    Stream.junk(strm__);
                    reset_buffer(undefined);
                    store(/* "-" */45);
                    store(match$3);
                    return number(strm__);
                  } else {
                    reset_buffer(undefined);
                    store(/* "-" */45);
                    return ident2(strm__);
                  }
              case 48 :
              case 49 :
              case 50 :
              case 51 :
              case 52 :
              case 53 :
              case 54 :
              case 55 :
              case 56 :
              case 57 :
                  exit = 4;
                  break;
              case 0 :
              case 1 :
              case 2 :
              case 3 :
              case 4 :
              case 5 :
              case 6 :
              case 7 :
              case 8 :
              case 11 :
              case 14 :
              case 15 :
              case 16 :
              case 17 :
              case 18 :
              case 19 :
              case 20 :
              case 21 :
              case 22 :
              case 23 :
              case 24 :
              case 25 :
              case 27 :
              case 28 :
              case 29 :
              case 30 :
              case 31 :
              case 41 :
              case 44 :
              case 46 :
              case 59 :
                  exit = 1;
                  break;
              case 33 :
              case 35 :
              case 36 :
              case 37 :
              case 38 :
              case 42 :
              case 43 :
              case 47 :
              case 58 :
              case 60 :
              case 61 :
              case 62 :
              case 63 :
              case 64 :
                  exit = 3;
                  break;
              
            }
          }
        } else {
          switch (switcher) {
            case 27 :
            case 29 :
                exit = 3;
                break;
            case 30 :
                exit = 2;
                break;
            case 26 :
            case 28 :
            case 31 :
                exit = 1;
                break;
            default:
              exit = 2;
          }
        }
      } else {
        exit = match >= 127 ? (
            match >= 192 ? 2 : 1
          ) : (
            match !== 125 ? 3 : 1
          );
      }
      switch (exit) {
        case 1 :
            Stream.junk(strm__);
            return keyword_or_error(match);
        case 2 :
            Stream.junk(strm__);
            reset_buffer(undefined);
            store(match);
            while(true) {
              var match$4 = Stream.peek(strm__);
              if (match$4 === undefined) {
                return ident_or_keyword(get_string(undefined));
              }
              if (match$4 >= 91) {
                var switcher$1 = match$4 - 95 | 0;
                if (switcher$1 > 27 || switcher$1 < 0) {
                  if (switcher$1 < 97) {
                    return ident_or_keyword(get_string(undefined));
                  }
                  
                } else if (switcher$1 === 1) {
                  return ident_or_keyword(get_string(undefined));
                }
                
              } else if (match$4 >= 48) {
                if (!(match$4 > 64 || match$4 < 58)) {
                  return ident_or_keyword(get_string(undefined));
                }
                
              } else if (match$4 !== 39) {
                return ident_or_keyword(get_string(undefined));
              }
              Stream.junk(strm__);
              store(match$4);
              continue ;
            };
        case 3 :
            Stream.junk(strm__);
            reset_buffer(undefined);
            store(match);
            return ident2(strm__);
        case 4 :
            Stream.junk(strm__);
            reset_buffer(undefined);
            store(match);
            return number(strm__);
        
      }
    };
  };
  var ident2 = function (strm__) {
    while(true) {
      var match = Stream.peek(strm__);
      if (match === undefined) {
        return ident_or_keyword(get_string(undefined));
      }
      if (match >= 94) {
        var switcher = match - 95 | 0;
        if (switcher > 30 || switcher < 0) {
          if (switcher >= 32) {
            return ident_or_keyword(get_string(undefined));
          }
          
        } else if (switcher !== 29) {
          return ident_or_keyword(get_string(undefined));
        }
        
      } else if (match >= 65) {
        if (match !== 92) {
          return ident_or_keyword(get_string(undefined));
        }
        
      } else {
        if (match < 33) {
          return ident_or_keyword(get_string(undefined));
        }
        switch (match - 33 | 0) {
          case 1 :
          case 6 :
          case 7 :
          case 8 :
          case 11 :
          case 13 :
          case 15 :
          case 16 :
          case 17 :
          case 18 :
          case 19 :
          case 20 :
          case 21 :
          case 22 :
          case 23 :
          case 24 :
          case 26 :
              return ident_or_keyword(get_string(undefined));
          case 0 :
          case 2 :
          case 3 :
          case 4 :
          case 5 :
          case 9 :
          case 10 :
          case 12 :
          case 14 :
          case 25 :
          case 27 :
          case 28 :
          case 29 :
          case 30 :
          case 31 :
              break;
          
        }
      }
      Stream.junk(strm__);
      store(match);
      continue ;
    };
  };
  var number = function (strm__) {
    while(true) {
      var match = Stream.peek(strm__);
      if (match !== undefined) {
        if (match >= 58) {
          if (!(match !== 69 && match !== 101)) {
            Stream.junk(strm__);
            store(/* "E" */69);
            return exponent_part(strm__);
          }
          
        } else if (match !== 46) {
          if (match >= 48) {
            Stream.junk(strm__);
            store(match);
            continue ;
          }
          
        } else {
          Stream.junk(strm__);
          store(/* "." */46);
          while(true) {
            var match$1 = Stream.peek(strm__);
            if (match$1 !== undefined) {
              var switcher = match$1 - 69 | 0;
              if (switcher > 32 || switcher < 0) {
                if ((switcher + 21 >>> 0) <= 9) {
                  Stream.junk(strm__);
                  store(match$1);
                  continue ;
                }
                
              } else if (switcher > 31 || switcher < 1) {
                Stream.junk(strm__);
                store(/* "E" */69);
                return exponent_part(strm__);
              }
              
            }
            return /* Float */Block.__(3, [Caml_format.caml_float_of_string(get_string(undefined))]);
          };
        }
      }
      return /* Int */Block.__(2, [Caml_format.caml_int_of_string(get_string(undefined))]);
    };
  };
  var exponent_part = function (strm__) {
    var match = Stream.peek(strm__);
    if (match !== undefined && !(match !== 43 && match !== 45)) {
      Stream.junk(strm__);
      store(match);
      return end_exponent_part(strm__);
    } else {
      return end_exponent_part(strm__);
    }
  };
  var end_exponent_part = function (strm__) {
    while(true) {
      var match = Stream.peek(strm__);
      if (match === undefined) {
        return /* Float */Block.__(3, [Caml_format.caml_float_of_string(get_string(undefined))]);
      }
      if (match > 57 || match < 48) {
        return /* Float */Block.__(3, [Caml_format.caml_float_of_string(get_string(undefined))]);
      }
      Stream.junk(strm__);
      store(match);
      continue ;
    };
  };
  var string = function (strm__) {
    while(true) {
      var match = Stream.peek(strm__);
      if (match !== undefined) {
        if (match !== 34) {
          if (match !== 92) {
            Stream.junk(strm__);
            store(match);
            continue ;
          }
          Stream.junk(strm__);
          var c;
          try {
            c = $$escape(strm__);
          }
          catch (exn){
            if (exn === Stream.Failure) {
              throw [
                    Stream.$$Error,
                    ""
                  ];
            }
            throw exn;
          }
          store(c);
          continue ;
        }
        Stream.junk(strm__);
        return get_string(undefined);
      }
      throw Stream.Failure;
    };
  };
  var $$char = function (strm__) {
    var match = Stream.peek(strm__);
    if (match !== undefined) {
      if (match !== 92) {
        Stream.junk(strm__);
        return match;
      }
      Stream.junk(strm__);
      try {
        return $$escape(strm__);
      }
      catch (exn){
        if (exn === Stream.Failure) {
          throw [
                Stream.$$Error,
                ""
              ];
        }
        throw exn;
      }
    } else {
      throw Stream.Failure;
    }
  };
  var $$escape = function (strm__) {
    var match = Stream.peek(strm__);
    if (match !== undefined) {
      if (match >= 58) {
        switch (match) {
          case 110 :
              Stream.junk(strm__);
              return /* "\n" */10;
          case 114 :
              Stream.junk(strm__);
              return /* "\r" */13;
          case 111 :
          case 112 :
          case 113 :
          case 115 :
              Stream.junk(strm__);
              return match;
          case 116 :
              Stream.junk(strm__);
              return /* "\t" */9;
          default:
            Stream.junk(strm__);
            return match;
        }
      } else {
        if (match >= 48) {
          Stream.junk(strm__);
          var match$1 = Stream.peek(strm__);
          if (match$1 !== undefined) {
            if (match$1 > 57 || match$1 < 48) {
              throw [
                    Stream.$$Error,
                    ""
                  ];
            }
            Stream.junk(strm__);
            var match$2 = Stream.peek(strm__);
            if (match$2 !== undefined) {
              if (match$2 > 57 || match$2 < 48) {
                throw [
                      Stream.$$Error,
                      ""
                    ];
              }
              Stream.junk(strm__);
              return Char.chr((Caml_int32.imul(match - 48 | 0, 100) + Caml_int32.imul(match$1 - 48 | 0, 10) | 0) + (match$2 - 48 | 0) | 0);
            }
            throw [
                  Stream.$$Error,
                  ""
                ];
          }
          throw [
                Stream.$$Error,
                ""
              ];
        }
        Stream.junk(strm__);
        return match;
      }
    } else {
      throw Stream.Failure;
    }
  };
  var comment = function (strm__) {
    while(true) {
      var match = Stream.peek(strm__);
      if (match !== undefined) {
        switch (match) {
          case 40 :
              Stream.junk(strm__);
              var match$1 = Stream.peek(strm__);
              if (match$1 !== undefined) {
                if (match$1 !== 42) {
                  Stream.junk(strm__);
                  return comment(strm__);
                } else {
                  Stream.junk(strm__);
                  comment(strm__);
                  return comment(strm__);
                }
              }
              throw Stream.Failure;
          case 41 :
              Stream.junk(strm__);
              continue ;
          case 42 :
              Stream.junk(strm__);
              while(true) {
                var match$2 = Stream.peek(strm__);
                if (match$2 !== undefined) {
                  if (match$2 !== 41) {
                    if (match$2 !== 42) {
                      Stream.junk(strm__);
                      return comment(strm__);
                    }
                    Stream.junk(strm__);
                    continue ;
                  }
                  Stream.junk(strm__);
                  return ;
                }
                throw Stream.Failure;
              };
          default:
            Stream.junk(strm__);
            continue ;
        }
      } else {
        throw Stream.Failure;
      }
    };
  };
  return (function (input) {
      return Stream.from((function (_count) {
                    return next_token(input);
                  }));
    });
}

exports.make_lexer = make_lexer;
/* No side effect */
