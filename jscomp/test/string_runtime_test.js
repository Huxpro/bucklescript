'use strict';

var Mt = require("./mt.js");
var List = require("../../lib/js/list.js");
var Block = require("../../lib/js/block.js");
var Bytes = require("../../lib/js/bytes.js");
var Caml_char = require("../../lib/js/caml_char.js");
var Caml_bytes = require("../../lib/js/caml_bytes.js");

var suites_000 = /* tuple */[
  "caml_is_printable",
  (function (param) {
      return /* Eq */Block.__(0, [
                Caml_char.caml_is_printable(/* "a" */97),
                true
              ]);
    })
];

var suites_001 = /* :: */[
  /* tuple */[
    "caml_string_of_bytes",
    (function (param) {
        var match = List.split(List.map((function (x) {
                    var b = Caml_bytes.caml_create_bytes(1000);
                    Caml_bytes.caml_fill_bytes(b, 0, x, /* "c" */99);
                    return /* tuple */[
                            Caml_bytes.bytes_to_string(b),
                            Caml_bytes.bytes_to_string(Bytes.init(x, (function (param) {
                                        return /* "c" */99;
                                      })))
                          ];
                  }), /* :: */[
                  1000,
                  /* :: */[
                    1024,
                    /* :: */[
                      1025,
                      /* :: */[
                        4095,
                        /* :: */[
                          4096,
                          /* :: */[
                            5000,
                            /* :: */[
                              10000,
                              /* [] */0
                            ]
                          ]
                        ]
                      ]
                    ]
                  ]
                ]));
        return /* Eq */Block.__(0, [
                  match[0],
                  match[1]
                ]);
      })
  ],
  /* [] */0
];

var suites = /* :: */[
  suites_000,
  suites_001
];

Mt.from_pair_suites("String_runtime_test", suites);

var S = /* alias */0;

var B = /* alias */0;

exports.S = S;
exports.B = B;
exports.suites = suites;
/*  Not a pure module */
