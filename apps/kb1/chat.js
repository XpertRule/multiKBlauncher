var input_history = [];
var sessionID;

var chat_mode = "browser";

function xrkb_chat(body_message, completeCB) {

    if (body_message.hasOwnProperty("input")) {
        input_history.push(body_message.input);
    }

    const number_regex_noguff = /^[\-\+]?(?:\d*\.\d+|\d+)$/g;
    const number_regex = /[\-\+]?(?:\d*\.\d+|\d+)/g;

    if (window.hasOwnProperty("XRchatMode") && (XRchatMode == "browser")) {
        document.location.hash = encodeURIComponent(JSON.stringify(input_history));

        var xr = {
            goxml: _goXML,
            getObject: function(aID, completeCB) {
                completeCB(_retrieveApp({object: aID}).item);
            }
        };

        var nlp = {

            chrono: {
                parseDate: function(inputTxt) {
                    return new Date(inputTxt);
                }
            },

            compare: function(matches, inputStr, mode, settings, isDate, completeCB) {
                var result = {
                    ok: true,
                    results: []
                };
                var inputStr2 = inputStr.trim().toLowerCase();
                for (var c = 0; c < matches.length; c++) {
                    if (typeof matches[c].text == "string") {
                        if (matches[c].text.trim().toLowerCase() == inputStr2) {
                            result.results.push({
                                id: matches[c].id
                            });
                        }
                    } else {
                        for (var cc = 0; cc < matches[c].text.length; cc++) {
                            if (matches[c].text[cc].trim().toLowerCase() == inputStr2) {
                                result.results.push({
                                    id: matches[c].id
                                });
                                break;
                            }
                        }
                    }
                }
                if (isDate) {
                    var dt = this.chrono.parseDate(inputStr);
                    if (dt && isNaN(dt)) {
                        dt = null;
                    }
                    if (dt) {
                        result.results.push({
                            id: dt
                        });
                    }
                }
                completeCB(result);
            }
        };
    } else {
        chat_mode = "server";
        var url;
        if (body_message.hasOwnProperty("url")) {
            url = body_message.url;
        } else {
            var a = document.location.pathname.split("/");
            a.splice(a.length - 1, 1);
            url = a.join("/");
        }
        var xr = {
            goxml: function(msg, completeCB, settings) {
                $.ajax({
                    url: url,
                    type: "post",
                    data: JSON.stringify({
                        method: "run",
                        msg: msg,
                        history: input_history
                    }),
                    processData: false,
                    dataType: "json",
                    success: function(d) {
                        if (!d.ok) {
                            console.log(d.error);
                        } else {
                            if (!sessionID) {
                                sessionID = d.msg.sessionReplayStack.sessionID;
                                document.location.hash = sessionID;
                            }
                            completeCB(d.msg);
                        }
                    },
                    error: function(e1, e2) {
                    }
                });
            },
            getObject: function(aID, completeCB) {
                $.ajax({
                    url: url,
                    type: "post",
                    data: JSON.stringify({
                        method: "info",
                        id: aID
                    }),
                    processData: false,
                    dataType: "json",
                    success: function(d) {
                        if (!d.ok) {
                            console.log(d.error);
                        } else {
                            completeCB(d.item);
                        }
                    },
                    error: function(e1, e2) {
                    }
                });
            }
        };

        var nlp = {
            compare: function(matches, inputStr, mode, settings, isDate, completeCB) {
                $.ajax({
                    url: url,
                    type: "post",
                    data: JSON.stringify({
                        method: "nlp",
                        matches: matches,
                        input: inputStr,
                        settings: settings,
                        isDate: isDate
                    }),
                    processData: false,
                    dataType: "json",
                    success: function(d) {
                        if (!d.ok) {
                            console.log(d.error);
                        } else {
                            completeCB(d.result);
                        }
                    },
                    error: function(e1, e2) {
                    }
                });
            }
        };
    }

    var xpertrule_nodeCallback = null;

    var global_settings = {
        debug: false,   // return debug in the response message
        timestamp: 0,

        minimumWordLength: 2,              // ignore words (for matching) below this length
        // stopWords: ["a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as","at","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"],
        "stopWords": [
            "a", "am", "an", "and", "are", "as","at","be", "by", "can",
            "eg", "etc", "had", "has", "i" , "ie", "if", "is", "it", "me",
            "my", "of", "on", "or", "per", "the", "to", "us", "we", "was"
        ],
        spellCheck: true,                  // apply spell checking to input
        presupplyHintValCount: 0,          // pre-supply a question hint if <= n logival values (0 = no presupply)
        presupplyHintNumRanges: false,     // pre-supply numeric ranges (if specified)

        minimumMatch: 1.1,         // minimum angle for match (logical value)
        minimumDifference: 0.3,    // matches witing n% of best = clash

        defaultPreamble: "Please supply a value for ",                    // default preamble for questions with no description
        hintPreamble: "I understand answers like... ",                    // preamble for hints
        nomatchPreamble: "I'm having trouble matching your answer. I understand answers like ",
        numHint: "Please supply a value using numeric characters",        // number question hint
        dateHint: "Please supply a date",                                 // date question hint
        noHintAvailable: "I can't supply any hints for this question",    // text question hint
        clashPreamble: "I found your answer ambiguous, did you mean... ", // multiple matching list values (based on minimumDifference)
        previousConfirmPreamble: "I understood your answer to be... ",    // confirm understood (previous) input
        badspellPreamble: "I don't recognise the following words... ",    // spelling error
        spellSuggestPreamble: "! Did you mean... ",                       // response between spelling error and suggestion
        numRangeHint: "Please supply a value between... ",                // numeric question out-of-range response (based on question.minvalue & question.maxvalue)
        dateRangeHint: "Please supply a date between... ",                // date question out-of-range response (based on question.minvalue & question.maxvalue)
        emptyMultiSelect: "None",                                         // continue from a multi-select list with no values
        multiSelSuffixHint: false,                                        // append multiSelSuffix to multi select questions
        multiSelSuffix: ", or NEXT for the next question",                // multi-select question suffix (should match words in multiSelDonePhrases)
        presupplyHint: " I understand answers like... ",                  // if < presupplyHintValCount values, preceed values with this
        numPresupplyHint: " I accept values between ",                    // presupplyHintNumRanges = true and the min & max values are set on the attribute
        datePresupplyHint: " I accept dates between ",                    // ditto (for date attributes)

        backPhrases: ["back", "previous"],
        restartPhrases: ["restart"],
        hintPhrases: ["hint", "help"],
        repeatPhrases: ["repeat", "again", "what", "sorry", "pardon"],
        donePhrases: ["done", "quit", "exit"],
        multiSelDonePhrases: ["next"],
        yesSuggestPhrases: ["yes"],     // positive response to "did you mean..." suggestion
        noSuggestPhrases: ["no"]        // negative response to "did you mean..." suggestion. Show the hint in this case
    };

    function extendGlobalSettings(newSettings, newSettings2) {
        var o = {};
        var aProp;
        for (aProp in global_settings) {
            o[aProp] = global_settings[aProp];
        }
        for (aProp in newSettings) {
            o[aProp] = newSettings[aProp];
        }
        for (aProp in newSettings2) {
            o[aProp] = newSettings2[aProp];
        }
        return o;
    }

    function buildSynonymList(text) {
        var a = text.split(",");
        for (var c = 0; c < a.length; c++) {
            a[c] = a[c].toLowerCase().trim();
            var isPrime = a[c].substr(0, 1) == "*";
            if (isPrime) {
                a[c] = a[c].substr(1).trim();
            }
            a[c] = {text: a[c], prime: isPrime};
        }
        return a;
    }

    function getPrimeSynonym(syns) {
        for (var c = 0; c < syns.length; c++) {
            if (syns[c].isPrime) {
                return syns[c].text;
            }
        }
        return syns[0].text; // no prime, return first
    }

    function buildHelp(aObject, justPrimeSynonyms) {
        var c;
        var hl = [];
        var hiddenValueProp = !aObject.props.hasOwnProperty("hiddenvaluesprop") ? null : aObject.props.hiddenvaluesprop == "" ? null : aObject.props.hiddenvaluesprop;
        for (c = 0; c < aObject.aValues.length; c++) {
            if (hiddenValueProp) {
                if (aObject.aValues[c][hiddenValueProp]) {
                    continue;
                }
            }
            if (justPrimeSynonyms) {
                hl.push(getPrimeSynonym(buildSynonymList(aObject.aValues[c].synonyms ? aObject.aValues[c].synonyms : aObject.aValues[c].aText)));
            } else {
                var value_synonyms = buildSynonymList(aObject.aValues[c].synonyms ? aObject.aValues[c].synonyms : aObject.aValues[c].aText);
                for (cc = 0; cc < value_synonyms.length; cc++) {
                    hl.push(value_synonyms[cc].text);
                }
            }
        }
        var s = "";
        for (c = 0; c < hl.length; c++) {
            s += (c == 0 ? "" : (c < hl.length - 1 ? ", " : " or ")) + hl[c];
        }
        return s;
    }

    var outtxt, inputs, old_log;
    var settings;
    var debug = [];
    var do_hint = false;
    var clash = [];
    var prev_answer = "";
    var prev_questionid = null;
    var prev_uniqueno = null;
    var prev_logval = null;
    var prev_errors = null;
    var prev_suggest = "";
    var audit_extend = null;
    var session_ident, session_audit;
    var current_multisel = null;
    var inputs = {};
    var i = body_message;
    var o = null;
    var utterance = ""; // global utterance

    function go() {
        try {
            //
            var xrSettings, callOptions;
            if (xr.settings) {
                xrSettings = xr.settings();
            } else {
                xrSettings = {};
            }
            if (i.hasOwnProperty("options")) {
                callOptions = i.options;
            } else {
                callOptions = {};
            }
            settings = extendGlobalSettings(xrSettings, callOptions);
            //
            var c, cc, match;
            if (i.hasOwnProperty("input")) {
                var inputTxt = i.input.trim();
                if (!i.hasOwnProperty("session")) {
                    throw "Subsequent answers must include the previous session";
                }
                if (!i.session.hasOwnProperty("next")) {
                    throw "Next question ID missing from session object";
                }
                audit_extend = {ts: new Date().toJSON(), id: i.session.next, txt: inputTxt, ok: false};

                var supplied_logval = ((inputTxt.length >= 2) && (inputTxt.charAt(0) == '"') && (inputTxt.charAt(inputTxt.length - 1) == '"'));
                if (supplied_logval) {
                    inputTxt = inputTxt.substr(1, inputTxt.length - 2);
                }

                var matches = [];
                /* if (!supplied_logval) {     should we supress system actions when a quoted value has been sent?   */
                    matches.push({text: settings.backPhrases, id: -1});
                    matches.push({text: settings.restartPhrases, id: -2});
                    matches.push({text: settings.hintPhrases, id: -3});
                    matches.push({text: settings.repeatPhrases, id: -4});
                    matches.push({text: settings.donePhrases, id: -5});
                    if (i.session.suggest) {
                        // prompted a user for a suggestion, accept yes and no
                        matches.push({text: settings.yesSuggestPhrases, id: -7});
                        matches.push({text: settings.noSuggestPhrases, id: -8});
                    }
                    matches.push({text: settings.multiSelDonePhrases, id: -6}); // always allow a "next" (used to be only for mult sel)
                /* } */
                if (i.session.next != 0) {
                    // o will already have been looked up
                    prev_questionid = o.aID;
                    prev_uniqueno = i.session.nextUNO;
                    var exact_match_only = false;
                    switch (o.aType) {
                        case 1: // TYPE_LIST
                        case 4: // TYPE_BOOLEAN
                            if ((o.aType == 1) && o.isMultiSel) {
                                // matches.push({text: settings.multiSelDonePhrases, id: -6});
                                if (Array.isArray(i.session.multisel)) {
                                    current_multisel = i.session.multisel;
                                } else {
                                    current_multisel = [];
                                }
                            }
                            var hiddenValueProp = !o.props.hasOwnProperty("hiddenvaluesprop") ? null : o.props.hiddenvaluesprop == "" ? null : o.props.hiddenvaluesprop;
                            for (c = 0; c < o.aValues.length; c++) {
                                if (hiddenValueProp) {
                                    if (o.aValues[c][hiddenValueProp]) {
                                        continue;
                                    }
                                }
                                if (supplied_logval) {
                                    matches.push({text: o.aValues[c].aName, id: c, vid: o.aValues[c].aID});
                                } else {
                                    var value_descr = o.aValues[c].synonyms ? o.aValues[c].synonyms : o.aValues[c].aText;
                                    var value_synonyms = buildSynonymList(value_descr);
                                    for (cc = 0; cc < value_synonyms.length; cc++) {
                                        matches.push({text: value_synonyms[cc].text, id: c, vid: o.aValues[c].aID});
                                    }
                                }
                            }
                            break;
                        case 10: // TYPE_TEXT
                            exact_match_only = true;
                            break;
                    }
                }
                //
                var r;
                if (inputTxt.length == 0) {
                    r = {ok: true, results: []};
                } else if (supplied_logval) {
                    r = {
                        ok: true,
                        results: []
                    };
                    var inputArr = inputTxt.split(",");
                    for (c = 0; c < matches.length; c++) {
                        for (cc = 0; cc < inputArr.length; cc++) {
                            inputTxt = inputArr[cc];
                            var match = false;
                            if (inputTxt.substr(0, 1) == "~") {
                                match = matches[c].vid == parseInt(inputTxt.substr(1));
                            } else if (matches[c].text instanceof Array) {
                                for (cc = 0; cc < matches[c].text.length; cc++) {
                                    if (matches[c].text[cc] == inputTxt) {
                                        match = true;
                                        break;
                                    }
                                }
                            } else {
                                match = matches[c].text == inputTxt;
                            }
                            if (match) {
                                r.results.push({
                                    id: matches[c].id,
                                    text: inputTxt
                                });
                                break;
                            }
                        }
                    }
                } else {
                    if (exact_match_only) {
                        r = {ok: false, results: []};
                        for (c = 0; (c < matches.length) && !r.ok; c++) {
                            for (cc = 0; cc < matches[c].text.length; cc++) {
                                if (matches[c].text[cc] == inputTxt.toLowerCase().trim()) {
                                    r.ok = true;
                                    r.results.push({id: matches[c].id});
                                    break;
                                }
                            }
                        }
                        carryOn(r);
                    } else {
                        var s2 = $.extend(true, {}, settings);
                        if (o && (o.aType == 10)) {
                            // TYPE_TEXT, ignore spelling
                            s2.spellCheck = false;
                        }
                        nlp.compare(matches, inputTxt, "multiple", s2, o && (o.aType == 3), function(aResult) {
                            carryOn(aResult);
                        });
                    }
                    return;
                }
                carryOn(r);
                function carryOn(r) {
                    try {
                        // console.log(JSON.stringify(r));
                        if (!r.ok && o && ((o.aType == 2) || (o.aType == 3) || (o.aType == 10))) {
                            // not expecting a match, ignore spelling
                            r = {ok: true, results: []};
                        }
                        if (!r.ok) {
                            debug.push("error (spell) : " + r.error);
                            prev_errors = r.error;
                            prev_suggest = r.suggest;
                        } else {
                            r = r.results;
                            if (r.length == 0) {
                                // no matches!
                                if (i.session.next == 0) {
                                    // xpertrule.message and xpertrule.pause continue (message ignores input text)
                                    if (inputTxt.length > 0) {
                                        /*
                                        console.log("Received input but not expecting any");
                                        do_hint = "hint";
                                        */
                                        try {
                                            inputs.options = JSON.parse(inputTxt);
                                            audit_extend.ok = true;
                                            debug.push("action = continue (with " + inputTxt + ")");
                                            if (inputs.options.action == "SET") {
                                                prev_answer = settings.previousConfirmPreamble + inputs.options.objectVal;
                                            }
                                        } catch (e) {
                                        }
                                    } else {
                                        inputs.options = {action: "OK"};
                                        audit_extend.ok = true;
                                        debug.push("action = continue");
                                    }
                                } else {
                                    var fNum;
                                    switch (o.aType) {
                                        case 1: // TYPE_LIST
                                        case 4: // TYPE_BOOLEAN
                                            // No matching values
                                            if ((o.aType == 1) && o.isMultiSel) {
                                                do_hint = "nomatch";
                                                /* uncomment below to allow for empty multi-select
                                                inputs.options = {action: "SET", objectID: o.aID, objectVal: []};
                                                console.log("Matched [" + o.aName + " = empty]");
                                                debug.push(o.aName + " = <empty>");
                                                */
                                            } else {
                                                do_hint = "nomatch";
                                            }
                                            break;
                                        case 2: // TYPE_NUMERIC
                                            var txt_numbers = ["zero", "one", "two", "three", "four", "five", "siz", "seven", "eight", "nine"];
                                            fNum = txt_numbers.indexOf(inputTxt.toLowerCase());
                                            if (fNum == -1) {
                                                var match = number_regex.exec(inputTxt);
                                                if (!match) {
                                                    throw settings.numHint;
                                                    // do_hint = "nomatch";
                                                    break;
                                                }
                                                fNum = parseFloat(match[0]);
                                                if (number_regex.exec(inputTxt)) {
                                                    throw "Multiple numbers supplied in message";
                                                }
                                            }
                                            if (o.props.minvalue < o.props.maxvalue) {
                                                if ((fNum < o.props.minvalue) || (fNum > o.props.maxvalue)) {
                                                    throw settings.numRangeHint + o.props.minvalue + " and " + o.props.maxvalue;
                                                    // do_hint = "numrange";
                                                    break;
                                                }
                                            }
                                            inputs.options = {action: "SET", objectID: o.aID, objectVal: fNum};
                                            audit_extend.ok = true;
                                            debug.push(o.aName + " = " + fNum);
                                            prev_answer = settings.previousConfirmPreamble + fNum;
                                            prev_logval = fNum;
                                            break;
                                        case 3: // TYPE_DATE
                                            throw settings.dateHint;
                                            /* done in NLP
                                            var dt = chrono.parseDate(inputTxt);
                                            if (dt === null) {
                                                throw "Invalid date";
                                            }
                                            fNum = dt.getTime() / 86400000;
                                            if (o.props.minvalue < o.props.maxvalue) {
                                                if ((fNum < o.props.minvalue) || (fNum > o.props.maxvalue)) {
                                                    do_hint = "numrange";
                                                    break;
                                                }
                                            }
                                            inputs.options = {action: "SET", objectID: o.aID, objectVal: fNum};
                                            audit_extend.ok = true;
                                            debug.push(o.aName + " = " + dt.toLocaleDateString());
                                            prev_answer = settings.previousConfirmPreamble + dt.toDateString();
                                            prev_logval = dt.toJSON();
                                            */
                                            break;
                                        case 10: // TYPE_TEXT
                                            inputs.options = {action: "SET", objectID: o.aID, objectVal: inputTxt};
                                            audit_extend.ok = true;
                                            debug.push(o.aName + " = " + inputTxt);
                                            prev_answer = settings.previousConfirmPreamble + inputTxt;
                                            prev_logval = inputTxt;
                                            break;
                                        default:
                                            throw "Unsupported object type [" + o.aName + "]";
                                    }
                                }
                            } else {
                                switch (r[0].id) {
                                    case -1:
                                        inputs.options = {action: "BACK"};
                                        audit_extend = null;
                                        if (i.session.multisel instanceof Array) {
                                            delete i.session.multisel;
                                        }
                                        debug.push("action = back");
                                        break;
                                    case -2:
                                        inputs.options = {action: "RESTART"};
                                        audit_extend = null;
                                        debug.push("action = restart");
                                        break;
                                    case -3:
                                        audit_extend = null;
                                        debug.push("action = hint");
                                        do_hint = "hint";
                                        break;
                                    case -4:
                                    case -8:
                                        audit_extend = null;
                                        debug.push("action = repeat");
                                        break;
                                    case -5:
                                        // todo : flag in session audit file that done has been sent
                                        var result = {
                                            ok: true,
                                            mode: "quit",
                                            vocabulary: [],
                                            session: i.session
                                        };
                                        result.session.next = 0;
                                        result.session.nextUNO = 0;
                                        completeCB(result);
                                        return;
                                    case -6:
                                        if ((chat_mode == "server") && (r.length == 1)) {
                                            // just recognised "next", click the next button. This DOES NOT support 0 value multi-sel
                                            var result = {
                                                ok: true,
                                                mode: "next",
                                                vocabulary: [],
                                                session: i.session
                                            };
                                            completeCB(result);
                                            return;
                                        }
                                        current_multisel = [];
                                        for (c = 1; c < r.length; c++) {
                                            current_multisel.push(o.aValues[r[c].id].aID);
                                        }
                                        audit_extend.txt = current_multisel;
                                        debug.push("action = multi-select done");
                                        if (Array.isArray(current_multisel)) {
                                            inputs.options = {action: "SET", objectID: i.session.next, objectVal: current_multisel};
                                        } else {
                                            inputs.options = {action: "SET", objectID: i.session.next, objectVal: []};
                                        }
                                        prev_answer = settings.previousConfirmPreamble;
                                        if (!Array.isArray(current_multisel) || current_multisel.length == 0) {
                                            prev_answer += settings.emptyMultiSelect;
                                        } else {
                                            for (c = 0; c < current_multisel.length; c++) {
                                                for (cc = 0; cc < o.aValues.length; cc++) {
                                                    if (o.aValues[cc].aID == current_multisel[c]) {
                                                        prev_answer += (c > 0 ? (c == current_multisel.length - 1 ? " and " : ", ") : "") + getPrimeSynonym(buildSynonymList(o.aValues[cc].synonyms ? o.aValues[cc].synonyms : o.aValues[cc].aText));
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        current_multisel = null;
                                        prev_questionid = o.aID;
                                        prev_logval = "";
                                        break;
                                    case -7:
                                        xrkb_chat({input: i.session.suggest, session: i.session}, completeCB);
                                        return;
                                        // n.b. intenionally no break
                                    default:
                                        switch (o.aType) {
                                            case 1: // TYPE_LIST
                                            case 4: // TYPE_BOOLEAN
                                                /*
                                                if ((o.aType == 1) && o.isMultiSel) {
                                                    var vls = [];
                                                    prev_answer = settings.previousConfirmPreamble;
                                                    for (c = 0; c < r.length; c++) {
                                                        if (r[c].angle < settings.minimumMatch) {
                                                            vls.push(o.aValues[r[c].id].aID);
                                                            console.log("Matched [" + o.aName + " = " + o.aValues[r[c].id].aName + "]");
                                                            debug.push(o.aName + " += " + o.aValues[r[c].id].aName);
                                                            prev_answer += (c > 0 ? (c == r.length - 1 ? " and " : ", ") : "") + r[c].text;
                                                        }
                                                    }
                                                    inputs.options = {action: "SET", objectID: o.aID, objectVal: vls};
                                                    audit_extend.ok = true;
                                                } else {
                                                    */
                                                    for (c = 1; c < r.length; c++) {
                                                        if (r[c].angle > r[0].angle * (1.0 + settings.minimumDifference)) {
                                                            break;
                                                        }
                                                    }
                                                    // do all clashes belong to the same value?
                                                    if (c > 1) {
                                                        var differentValues = false;
                                                        for (cc = 1; (cc < c) && !differentValues; cc++) {
                                                            if (r[0].id != r[cc].id) {
                                                                differentValues = true;
                                                            }
                                                        }
                                                        if (!differentValues) {
                                                            c = 1;
                                                        }
                                                    }
                                                    //
                                                    if (c > 1) {
                                                        r.splice(c, r.length - c); // truncate to clashing values
                                                        clash = r;
                                                        debug.push(o.aName + " : clash");
                                                        audit_extend.ok = false;
                                                    } else {
                                                        if ((o.aType == 1) && o.isMultiSel) {
                                                            if (current_multisel.indexOf(o.aValues[r[0].id].aID) == -1) {
                                                                current_multisel.push(o.aValues[r[0].id].aID);
                                                            } else {
                                                                current_multisel.splice(current_multisel.indexOf(o.aValues[r[0].id].aID), 1);
                                                            }
                                                        } else {
                                                            inputs.options = {action: "SET", objectID: o.aID, objectVal: o.aValues[r[0].id].aID};
                                                        }
                                                        audit_extend.ok = true;
                                                        debug.push(o.aName + " = " + o.aValues[r[0].id].aName);
                                                        prev_answer = settings.previousConfirmPreamble + r[0].text;
                                                        prev_logval = "~" + o.aValues[r[0].id].aID;
                                                    }
                                                /*
                                                }
                                                */
                                                break;
                                            case 3:
                                                var dt = r[0].id;
                                                if (typeof dt == "string") {
                                                    dt = new Date(dt);
                                                }
                                                fNum = dt.getTime() / 86400000;
                                                if (o.props.minvalue < o.props.maxvalue) {
                                                    if ((fNum < o.props.minvalue) || (fNum > o.props.maxvalue)) {
                                                        do_hint = "numrange";
                                                        break;
                                                    }
                                                }
                                                inputs.options = {action: "SET", objectID: o.aID, objectVal: fNum};
                                                audit_extend.ok = true;
                                                debug.push(o.aName + " = " + dt.toLocaleDateString());
                                                prev_answer = settings.previousConfirmPreamble + dt.toDateString();
                                                prev_logval = dt.toJSON();
                                                break;
                                            default:
                                                throw "Found crazy match which should not exist";
                                        }
                                }
                            }
                        }
                        //
                        run();
                    } catch (e) {
                        completeCB({
                            ok: false,
                            error: e.toString()
                        });
                        return;
                    }
                }
            } else {
                run();
            }
        } catch (e) {
            completeCB({
                ok: false,
                error: e.toString()
            });
            return;
        }
        //
        function run() {
            try {
                if (i.hasOwnProperty("session")) {
                    if (audit_extend) {
                        if (!Array.isArray(i.session.audit)) {
                            i.session.audit = [];
                        }
                        for (var c = 0; c < i.session.audit.length; c++) {
                            if (i.session.audit[c].id == audit_extend.id) {
                                i.session.audit[c] = audit_extend;
                                break;
                            }
                        }
                        if (c == i.session.audit.length) {
                            i.session.audit.push(audit_extend);
                        }
                    }
                    inputs.sessionReplayStack = i.session;
                    session_ident = i.session.ident;
                    session_audit = i.session.audit;
                    if (i.session.utterance) {
                        utterance = i.session.utterance;
                    }
                } else {
                    inputs.startup = true;
                    session_ident = "local";
                    // pre-supply inputs via msg.inputs array [{name: "", value: ""}]
                    if (i.hasOwnProperty("inputs")) {
                        inputs.inputs = i.inputs;
                    }
                    if (i.hasOwnProperty("utterance")) {
                        utterance = i.utterance;
                    }
                }
                inputs.utterance = utterance;
                var aResponse;
                xr.goxml(
                    inputs,
                    function(result) {
                        var c, cc, hl;

                        aResponse = {
                            ok: true,
                            vocabulary: []
                        };
                        if (inputs && inputs.options && inputs.options.action) {
                            switch (inputs.options.action) {
                                case "BACK":
                                    aResponse.prevSpecial = "back";
                                    break;
                                case "RESTART":
                                    aResponse.prevSpecial = "restart";
                                    break;
                            }
                        }
                        settings.backPhrases.forEach(function(word) {
                            aResponse.vocabulary.push(word);
                        }, this);
                        settings.restartPhrases.forEach(function(word) {
                            aResponse.vocabulary.push(word);
                        }, this);
                        settings.hintPhrases.forEach(function(word) {
                            aResponse.vocabulary.push(word);
                        }, this);
                        settings.repeatPhrases.forEach(function(word) {
                            aResponse.vocabulary.push(word);
                        }, this);
                        settings.donePhrases.forEach(function(word) {
                            aResponse.vocabulary.push(word);
                        }, this);
                        if (prev_answer.length > 0) {
                            aResponse.previous = prev_answer;
                        }
                        if (prev_logval !== null) {
                            aResponse.previousValue = prev_logval;
                        }
                        if (prev_questionid !== null) {
                            aResponse.previousQuestionID = prev_questionid;
                        }
                        if (prev_uniqueno !== null) {
                            aResponse.previousUniqueNo = prev_uniqueno;
                        }
                        //
                        function finish() {
                            if (aResponse.ok) {
                                if (prev_errors) {
                                    aResponse.mode = "question";
                                    aResponse.output = settings.badspellPreamble;
                                    for (c = 0; c < prev_errors.length; c++) {
                                        aResponse.output += (c > 0 ? (c == prev_errors.length - 1 ? " and " : ", ") : "") + prev_errors[c];
                                    }
                                    aResponse.output += settings.spellSuggestPreamble + prev_suggest + "?";
                                    aResponse.suggest = prev_suggest;
                                    aResponse.session.suggest = prev_suggest;
                                } else {
                                    if (aResponse.session && aResponse.session.hasOwnProperty("suggest")) {
                                        delete aResponse.session.suggest;
                                    }
                                }
                                if (result.outputs.length > 0) {
                                    aResponse.outputs = result.outputs;
                                }
                                if (debug.length > 0 && settings.debug) {
                                    aResponse.debug = debug;
                                }
                                if (session_ident) {
                                    if (aResponse.session) {
                                        aResponse.session.ident = session_ident;
                                    }
                                }
                                if (session_audit) {
                                    aResponse.session.audit = session_audit;
                                }
                                aResponse.session.utterance = utterance;
                            }
                            completeCB(aResponse);
                        }
                        //
                        var s = result.state.split(":");
                        switch (s[0]) {
                            case "CAPTURE":
                                var unique_no = s[2];
                                xr.getObject(s[1], function(aObject) {
                                    var o = aObject;
                                    aResponse.questionID = o.aID;
                                    aResponse.uniqueNo = unique_no ? parseInt(unique_no) : null;
                                    var hiddenValueProp = !o.props.hasOwnProperty("hiddenvaluesprop") ? null : o.props.hiddenvaluesprop == "" ? null : o.props.hiddenvaluesprop;
                                    if (clash.length > 0) {
                                        aResponse.mode = "question";
                                        aResponse.output = settings.clashPreamble;
                                        for (c = 0; c < clash.length; c++) {
                                            aResponse.output += (c > 0 ? (c == clash.length - 1 ? " or " : ", ") : "") + clash[c].text;
                                        }
                                    } else if (do_hint) {
                                        if (do_hint == "hint") {
                                            aResponse.mode = "hint";
                                        } else if (do_hint == "nomatch") {
                                            aResponse.mode = "question";
                                        } else if (do_hint == "numrange") {
                                            aResponse.mode = "question";
                                        } else {
                                            console.log("unknown hint type");
                                        }
                                        switch (o.aType) {
                                            case 1: // TYPE_LIST
                                            case 4: // TYPE_BOOLEAN
                                                if (do_hint == "nomatch") {
                                                    aResponse.output = settings.nomatchPreamble;
                                                } else {
                                                    aResponse.output = settings.hintPreamble;
                                                }
                                                aResponse.output += buildHelp(o, true);
                                                break;
                                            case 2: // TYPE_NUMERIC
                                                if (do_hint == "numrange") {
                                                    aResponse.output = settings.numRangeHint + o.props.minvalue + " and " + o.props.maxvalue;
                                                } else {
                                                    aResponse.output = settings.numHint;
                                                }
                                                break;
                                            case 3: // TYPE_DATE
                                                if (do_hint == "numrange") {
                                                    aResponse.output = settings.dateRangeHint + (new Date(o.props.minvalue * 86400000).toLocaleDateString()) + " and " + (new Date(o.props.maxvalue * 86400000).toLocaleDateString());
                                                } else {
                                                    aResponse.output = settings.dateHint;
                                                }
                                                break;
                                            default:
                                                aResponse.output = settings.noHintAvailable;
                                                break;
                                        }
                                    } else if (o.props.customcapture) {
                                        aResponse.mode = "custom_question";
                                        aResponse.output = o.props.customcapture;
                                    } else {
                                        aResponse.mode = "question";
                                        var descr_parts;
                                        var descr = "";
                                        if (chat_mode == "browser") {
                                            descr = o.GetDescription(false);
                                        } else {
                                            if (o.props) {
                                                descr = o.props.description;
                                            }
                                        }
                                        if (descr.length > 0) {
                                            descr_parts = descr.split("|");
                                            aResponse.output = descr_parts[0];
                                            if ((o.aID == result.sessionReplayStack.next) && (o.aType == 1) && o.isMultiSel && (descr_parts.length > 1)) {
                                                aResponse.output = descr_parts[1];
                                            }
                                        } else {
                                            aResponse.output = settings.defaultPreamble + o.aName;
                                        }
                                        if ((o.aType == 1) && o.isMultiSel && settings.multiSelSuffixHint) {
                                            aResponse.output += settings.multiSelSuffix;
                                        }
                                        if (((o.aType == 1) || (o.aType == 4)) && (settings.presupplyHintValCount > 0) && (o.aValues.length <= settings.presupplyHintValCount)) {
                                            aResponse.output += settings.presupplyHint + buildHelp(o, true);
                                        }
                                        if ((o.aType == 2) && settings.presupplyHintNumRanges && (o.props.minvalue < o.props.maxvalue)) {
                                            aResponse.output += settings.numPresupplyHint + o.props.minvalue + " and " + o.props.maxvalue;
                                        }
                                        if ((o.aType == 3) && settings.presupplyHintNumRanges && (o.props.minvalue < o.props.maxvalue)) {
                                            aResponse.output += settings.datePresupplyHint + (new Date(o.props.minvalue * 86400000).toLocaleDateString()) + " and " + (new Date(o.props.maxvalue * 86400000).toLocaleDateString());
                                        }
                                        if (o.props.extrainfo) {
                                            aResponse.extraoutput = o.props.extrainfo;
                                        }
                                        if (o.props && o.props.hasOwnProperty("spokendescr") && (o.props.spokendescr.length > 0)) {
                                            descr_parts = o.props.spokendescr.split("|");
                                            aResponse.speak = descr_parts[0];
                                            if ((o.aID == result.sessionReplayStack.next) && (o.aType == 1) && o.isMultiSel && (descr_parts.length > 1)) {
                                                aResponse.speak = descr_parts[1];
                                            }
                                        }
                                    }
                                    // speech rec helper
                                    switch (o.aType) {
                                        case 1: // TYPE_LIST
                                        case 4: // TYPE_BOOLEAN
                                            for (c = 0; c < o.aValues.length; c++) {
                                                if (hiddenValueProp) {
                                                    if (o.aValues[c][hiddenValueProp]) {
                                                        continue;
                                                    }
                                                }
                                                /* this version gives all the synonyms as help */
                                                var value_descr = o.aValues[c].synonyms ? o.aValues[c].synonyms : o.aValues[c].aText;
                                                var value_synonyms = buildSynonymList(value_descr);
                                                for (cc = 0; cc < value_synonyms.length; cc++) {
                                                    aResponse.vocabulary.push(value_synonyms[cc].text);
                                                }
                                                /* */
                                                /* this version gives the value names as help * /
                                                aResponse.vocabulary.push(o.aValues[c].aName);
                                                / * */
                                            }
                                            break;
                                    }
                                    // manual selection
                                    aResponse.allow_blank = o.props.allowblank;
                                    switch (o.aType) {
                                        case 1: // TYPE_LIST
                                        case 4: // TYPE_BOOLEAN
                                            if (o.isMultiSel) {
                                                aResponse.question_mode = "multiple";
                                            } else {
                                                aResponse.question_mode = "select";
                                                if ($.isPlainObject(o.props.selectmode) && (o.props.selectmode.type == "enum")) {
                                                    aResponse.select_mode = o.props.selectmode.val;
                                                }
                                            }
                                            aResponse.question_values = [];
                                            for (c = 0; c < o.aValues.length; c++) {
                                                if (hiddenValueProp) {
                                                    if (o.aValues[c][hiddenValueProp]) {
                                                        continue;
                                                    }
                                                }
                                                var vo = {id: o.aValues[c].aID, text: o.aValues[c].aText};
                                                if (o.aValues[c].hasOwnProperty("caption")) {
                                                    vo.caption = o.aValues[c].caption ? o.aValues[c].caption : o.aValues[c].aText;
                                                }
                                                if (o.aValues[c].hasOwnProperty("descr")) {
                                                    vo.description = o.aValues[c].descr;
                                                }
                                                if (o.aValues[c].hasOwnProperty("imageSrc")) {
                                                    vo.image = o.aValues[c].imageSrc;
                                                }
                                                if (o.aValues[c].hasOwnProperty("extraBtn")) {
                                                    var b = o.aValues[c].extraBtn.split("|");
                                                    vo.btntxt = b[0];
                                                    vo.btnurl = b[1];
                                                }
                                                aResponse.question_values.push(vo);
                                            }
                                            break;
                                        case 2: // TYPE_NUMERIC
                                            aResponse.question_mode = "number";
                                            break;
                                        case 3: // TYPE_DATE
                                            aResponse.question_mode = "date";
                                            break;
                                        case 10: // TYPE_TEXT
                                            if (o.props.isfileupload) {
                                                aResponse.question_mode = "upload";
                                            } else {
                                                aResponse.question_mode = "text";
                                            }
                                            break;
                                    }
                                    // auto select (prob from initial uttering)
                                    if (o.props._default && (o.props.defaultmode != "")) {
                                        switch (o.aType) {
                                            case 1: // TYPE_LIST
                                            case 4: // TYPE_BOOLEAN
                                            case 2: // TYPE_NUMERIC
                                            case 10: // TYPE_TEXT
                                                aResponse.autoselect = o.props._default;
                                                break;
                                            case 3: // TYPE_DATE
                                                var dt = new Date(o.props._default * 86400000);
                                                aResponse.autoselect = dt.toJSON();
                                                break;
                                        }
                                        aResponse.autoselectcontinue = false;
                                    }
                                    // prev answers
                                    if (session_audit) {
                                        for (c = 0; c < session_audit.length; c++) {
                                            if (session_audit[c].id == o.aID) {
                                                aResponse.default = session_audit[c].txt;
                                                if ($.isArray(aResponse.default) || ((aResponse.default.substr(0, 1) == "\"") && (aResponse.default.substr(aResponse.default.length - 1, 1) == "\""))) {
                                                    if (!$.isArray(aResponse.default)) {
                                                        aResponse.default = aResponse.default.substr(1, aResponse.default.length - 2);
                                                        if (aResponse.default.substr(0, 1) == "~") {
                                                            aResponse.default = aResponse.default.substr(1);
                                                        }
                                                    }
                                                }
                                                switch (o.aType) {
                                                    case 1: // TYPE_LIST
                                                    case 4: // TYPE_BOOLEAN
                                                        if ($.isArray(aResponse.default)) {
                                                            for (cc = 0; cc < aResponse.question_values.length; cc++) {
                                                                if ($.inArray(aResponse.question_values[cc].id, aResponse.default) >= 0) {
                                                                    aResponse.question_values[cc].default = true;
                                                                }
                                                            }
                                                        } else {
                                                            aResponse.default = parseInt(aResponse.default, 10);
                                                            for (cc = 0; cc < aResponse.question_values.length; cc++) {
                                                                if (aResponse.question_values[cc].id == aResponse.default) {
                                                                    aResponse.question_values[cc].default = true;
                                                                }
                                                            }
                                                        }
                                                        break;
                                                    case 2: // TYPE_NUMERIC
                                                        var match = number_regex.exec(aResponse.default);
                                                        if (!match) {
                                                            aResponse.default = "";
                                                        } else {
                                                            aResponse.default = parseFloat(match[0]);
                                                        }
                                                        break;
                                                    case 3: // TYPE_DATE
                                                        aResponse.default = aResponse.default;
                                                        break;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                    //
									if (!aResponse.hasOwnProperty("speak")) {
										aResponse.speak = aResponse.output;
									}
                                    //
                                    aResponse.session = result.sessionReplayStack;
                                    aResponse.session.next = o.aID;
                                    aResponse.session.nextUNO = o.hitCount;
                                    if (current_multisel) {
                                        aResponse.session.multisel = current_multisel;
                                    }
                                    finish();
                                });
                                return;
                            case "DEBUG":
                                aResponse.mode = "message";
                                s.splice(0, 1);
                                aResponse.output = s.join(":");
                                var a = aResponse.output.split("|");
                                if (a.length > 1) {
                                    aResponse.output = a[0];
                                    aResponse.speak = a[1];
                                }
                                aResponse.session = result.sessionReplayStack;
                                aResponse.session.next = 0;
                                aResponse.session.nextUNO = 0;
                                break;
                            case "PAUSE":
                                aResponse.mode = "pause";
                                s.splice(0, 1);
                                aResponse.output = s.join(":");
                                try {
                                    var o = JSON.parse(aResponse.output);
                                    if (o.hasOwnProperty("speak")) {
                                        aResponse.speak = o.speak;
                                        delete o.speak;
                                    }
                                    aResponse.output = o; // replace stringified object with actual object
                                } catch (e) {
                                }
                                aResponse.session = result.sessionReplayStack;
                                aResponse.session.next = 0;
                                aResponse.session.nextUNO = 0;
                                break;
                            case "END":
                                if (do_hint) {
                                    aResponse.mode = "hint";
                                    aResponse.output = settings.hintPreamble;
                                    hl = [];
                                    settings.backPhrases.forEach(function(word) {
                                        hl.push(word);
                                    }, this);
                                    settings.restartPhrases.forEach(function(word) {
                                        hl.push(word);
                                    }, this);
                                    for (c = 0; c < hl.length; c++) {
                                        aResponse.output += (c > 0 ? (c == hl.length - 1 ? " or " : ", ") : "") + hl[c];
                                    }
                                } else {
                                    aResponse.mode = "end";
                                }
                                aResponse.session = result.sessionReplayStack;
                                break;
                            case "ERROR":
                                aResponse.ok = false;
                                aResponse.error = result.description;
                                aResponse.session = result.sessionReplayStack;
                                break;
                            default:
                                aResponse.ok = false;
                                aResponse.error = "unknown pause state : " + s[0]; // result.state; // unknown pause state
                        }
                        if (!aResponse.hasOwnProperty("speak") && aResponse.hasOwnProperty("output")) {
                            aResponse.speak = aResponse.output;
                        }
                        finish();
                    },
                    {
                        callbackFn: xpertrule_nodeCallback
                    }
                );
            } catch (e) {
                // throw e; // uncomment to show console errors
                completeCB({
                    ok: false,
                    error: "Inference exception : " + e.toString()
                });
            }
        }
    }
    //
    if (i.session && i.session.next != 0) {
        xr.getObject(i.session.next, function(aObject) {
            o = aObject;
            go();
        });
    } else {
        go();
    }
}

function loadSession(sessionID, completeCB) {
    var a = document.location.pathname.split("/");
    a.splice(a.length - 1, 1);
    var url = a.join("/");
    $.ajax({
        url: url,
        type: "post",
        data: JSON.stringify({
            method: "loadsession",
            sessionid: sessionID
        }),
        processData: false,
        dataType: "json",
        success: function(d) {
            if (!d.ok) {
                console.log(d.error);
                completeCB(null);
                return;
            }
            if ($.isArray(d.history) && (d.history.length == 0)) {
                d.history = null;
            }
            completeCB(d.history);
        },
        error: function(e1, e2) {
            completeCB(null);
        }
    });
}
