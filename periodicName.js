//cleaner ver of application
var model = {
	periodicTable : ["h", "he", 
					 "li", "be", "b", "c", "n", "o", "f", "ne", 
					 "na", "mg", "al", "si", "p", "s", "cl", "ar", 
					 "k", "ca", "sc", "ti", "v", "cr", "mn", "fe", "co", "ni", "cu", "zn", "ga", "ge", "as", "se", "br", "kr", 
					 "rb", "sr", "y", "zr", "nb", "mo", "tc", "ru", "rh", "pd", "ag", "cd", "in", "sn", "sb", "te", "i", "xe", 
					 "cs", "ba", "la", "ce", "pr", "nd", "pm", "sm", "eu", "gd", "tb", "dy", "ho", "er", "tm", "yb", "lu", "hf", "ta", "w", "re", "os", "ir", "pt", "au", "hg", "ti", "pb", "bi", "po", "at", "rn",
					 "fr", "ra", "ac", "th", "pa", "u", "np", "pu", "am", "cm", "bk", "cf", "es", "fm", "md", "no", "lr", "rf", "db", "sg", "bh", "hs", "mt", "ds", "rg", "cn", "uut", "fl", "uup", "lv", "uus", "uuo"
					],
	name : {
		singles : [],//gets updated to hold, single letters, then their matching indices from periodic table
		doubles : [],//gets updated to hold double letters, then their matching indices from periodic table
		first : [],//gets updated to hold the call to spellCheck starting with checkSingles
		second : []//get updated to hold the call to spellCheck starting with checkDoubles
	}
};
var controls = {
	init : function() {
		view.init();
		controls.counter = this.forCount();//initialize the counter used in spellCheck functions
	},
	forCount : function() {
		var counter = 0;
		return {
			get : function() {
				return counter;
			},
			increment : function(fold) {
				return counter += 1 * fold;
			},
			reset : function() {
				return counter = 0;
			}
		};
	},
	singlizeName : function(name) {
		for (var i = 0; i < name.length; i++) {
			model.name.singles.push(name.slice(i, i + 1));//pushes the single letters of a name to model.name.singles
		}
		return model.name.singles;
	},
	doublizeName : function(name) {
		for (var i = 0; i < name.length - 1; i++) {
			model.name.doubles.push(model.name.singles[i] + model.name.singles[i + 1]);//pushes the various 2 letter combos to model.name.doubles
		}
		return model.name.doubles;
	},
	compareToTable : function(arrayOfSingles, arrayOfDoubles) { //takes in the singles and doubles arrays
		var matches = {
			singles : [],
			doubles : []
		}; //returns this object
		for (var i = 0; i < arrayOfSingles.length; i++){
			matches.singles.push(model.periodicTable.indexOf(arrayOfSingles[i])); //pushes the indexOf each single letter as found in periodicTable, -1 for not there
		}
		for (var j = 0; j < arrayOfDoubles.length; j++) {
			matches.doubles.push(model.periodicTable.indexOf(arrayOfDoubles[j])); //pushes the indexOf each double letter combo as founnd in periodicTable, -1 for not there
		}
		matches.doubles.push(-1);
		return matches;
	},
	updateModel : function(object) { //updates the model with the values from the matches object returned above
		model.name.singles = object.singles;
		model.name.doubles = object.doubles;
	},
	spellCheck : { 
		checkSingles : function(indexStart, callNumber) { 
			var tracker = controls.counter.get(); 
			var array = model.name.singles;
			console.log("inside checkSingles, tracker is: ", tracker);
			if (array[indexStart] > -1) {
				model.name[callNumber].push(array[indexStart]);  
				return this.checkSingles(indexStart + 1, callNumber); 
			} else if (array[indexStart] == -1 && tracker <= 2) {
				controls.counter.increment(1);
				return this.checkDoubles(indexStart, callNumber); 
			} else if (array[indexStart] == -1 && tracker == 2) { 
				return false; 
			}
		},
		 checkDoubles : function(indexStart, callNumber) {
			var tracker = controls.counter.get();
			var array = model.name.doubles;
			console.log("inside checkDoubles, tracker is: ", tracker);
			if (array[indexStart] > -1) {
				model.name[callNumber].push(array[indexStart]); 
				return this.checkDoubles(indexStart + 2, callNumber);
			} else if (array[indexStart] == -1 && tracker <= 2) {
				controls.counter.increment(1); 
				return this.checkSingles(indexStart, callNumber);
			} else if (array[indexStart] == -1 && tracker == 2) {
				return false; 
			}
		}
	},
	holdValues : function(array) {
		var holder = [];
		for (var i = 0; i < array.length; i++) {
			holder.push(model.periodicTable[array[i]]);
		}
		return holder;
	},
	holdOptions : function() {
		return {
			first : model.name.first,
			second: model.name.second
		}
	},
	validateSpelling : function(array, string) { 
		var holder = this.holdValues(array);
		holder = holder.join("");
		console.log(holder);
		if (holder == string) {
			return true;
		} else {
			return false;
		}
	},
	validateDiff : function(array1, array2) {
		if (JSON.stringify(array1) === JSON.stringify(array2)) {
			console.log("No difference");
			return false;
		} else {
			console.log("differences are present");
			return true;
		}
	},
	//gets the symbols that are possible for spelling the name
	//still will need something similar, but I don't know what this is doing right now
	grabPeriodicObjects : function(array) {
		var holder = this.holdValues(array);
		var periodicObjects = {};
		for (var i = 0; i < holder.length; i++) {
			periodicObjects[i] = periodicObject[holder[i]];
		}
		return periodicObjects;
	},
	//clears model holders for new name eval
	clearHolders : function() {
		model.name.singles = [];
		model.name.doubles = [];
		model.name.first = [];
		model.name.second = [];
	}
};
var view = {
	init : function() {
		this.output = $("#output")[0];
		this.genName = $("#generatedName")[0];
		this.eval();
		this.updateWith.clear();
	},
	grabName : function() {
		var name = $("#userName")[0];
		this.userInput = name.value.toLowerCase();
	},
	updateWith : {
		notName : function() {
			view.output.innerHTML = "This is not a valid name!"
		},
		notPossible : function() {
			view.output.innerHTML = "Sorry, your name cannot be spelled. :("
		},
		spelledOptions : function() {
			var options = controls.holdOptions();
			var firstObjects, secondObjects;
			if (controls.validateDiff(options.first, options.second)) {
				if (controls.validateSpelling(options.first, view.userInput)) {
					firstObjects = controls.grabPeriodicObjects(options.first);
					for (elements in firstObjects) {
						$("#generatedName").append("<ul>" +
													    "<li>" + firstObjects[elements].atomicNumber + "</li>" +
													    "<li>" + firstObjects[elements].symbol + "</li>" +
													    "<li>" + firstObjects[elements].name + "</li>" +
														"<li>" + firstObjects[elements].atomicWeight + "</li>" +
													"</ul>"
							);
					}
					$("#generatedName").append("</br>");
				} else if (controls.validateSpelling(options.second, view.userInput)) {
					secondObjects = controls.grabPeriodicObjects(options.second);
					for (elements in secondObjects) {
						$("#generatedName").append("<ul>" +
														"<li>" + secondObjects[elements].atomicNumber + "</li>" +
													    "<li>" + secondObjects[elements].symbol + "</li>" +
													    "<li>" + secondObjects[elements].name + "</li>" +
													    "<li>" + secondObjects[elements].atomicWeight + "</li>" +
													"</ul>"
							);
					}
					$("#generatedName").append("</br>");
				}
			} else if (controls.validateSpelling(options.first, view.userInput)) {
				firstObjects = controls.grabPeriodicObjects(options.first);
					for (elements in firstObjects) {
						$("#generatedName").append("<ul>" +
														"<li>" + firstObjects[elements].atomicNumber + "</li>" +
													    "<li>" + firstObjects[elements].symbol + "</li>" +
													    "<li>" + firstObjects[elements].name + "</li>" +
													    "<li>" + firstObjects[elements].atomicWeight + "</li>" +
													"</ul>"
							);
					}
					$("#generatedName").append("</br>");
			}
		},
		clear : function() {
			$("#clear").on('click', function() {
				console.log("the problem is elsewayre");
				$("#generatedName").empty();
			});
		}
	},
	eval : function() {
		$("#generate").on('click', function() {
				view.grabName(); //grab the name each time in case it changes
				var singles = controls.singlizeName(view.userInput); 
				var doubles = controls.doublizeName(view.userInput);
				var matches = controls.compareToTable(singles, doubles);
				controls.updateModel(matches);
				console.log("model singles  ", model.name.singles);
				console.log("model doubles  ", model.name.doubles);
				controls.spellCheck.checkSingles(0, "first");
				controls.counter.reset();
				console.log("this is in between first call and second call");
				controls.spellCheck.checkDoubles(0, "second");
				console.log("first array after call to spellcheck   ", model.name.first);
				console.log("second array after call to spellcheck   ", model.name.second);
				controls.validateDiff(model.name.first, model.name.second);
				console.log("grabPeriodicObjects test  ", controls.grabPeriodicObjects(model.name.second));
				view.updateWith.spelledOptions();
				controls.clearHolders();
		});
	}

};

controls.init();

//atomicNumber
//Symbol
//Name
//atomicWeight

//Vomit on my sweater already, OLD SPAGHETTI
//array of all elemental symbols in lowercase
// var elemArray = [
// "h", "he", 
// "li", "be", "b", "c", "n", "o", "f", "ne", 
// "na", "mg", "al", "si", "p", "s", "cl", "ar", 
// "k", "ca", "sc", "ti", "v", "cr", "mn", "fe", "co", "ni", "cu", "zn", "ga", "ge", "as", "se", "br", "kr", 
// "rb", "sr", "y", "zr", "nb", "mo", "tc", "ru", "rh", "pd", "ag", "cd", "in", "sn", "sb", "te", "i", "xe", 
// "cs", "ba", "la", "ce", "pr", "nd", "pm", "sm", "eu", "gd", "tb", "dy", "ho", "er", "tm", "yb", "lu", "hf", "ta", "w", "re", "os", "ir", "pt", "au", "hg", "ti", "pb", "bi", "po", "at", "rn",
// "fr", "ra", "ac", "th", "pa", "u", "np", "pu", "am", "cm", "bk", "cf", "es", "fm", "md", "no", "lr", "rf", "db", "sg", "bh", "hs", "mt", "ds", "rg", "cn", "uut", "fl", "uup", "lv", "uus", "uuo"
// ];
// //allows to find all indexes of the occurence of a single character, important if you want to check if a thing can be spelled
// function findIndices(string, chara) {
// 	var indices = [];
// 	for (var i = 0; i < string.length; i++) {
// 		if (string[i] === chara) {
// 			indices.push(i);
// 		}
// 	}
// 	return indices;
// };
// //same as above but for two characters, consider refactoring into a single function or class
// function findDoubleIndices(string, doub) {
// 	var indices = [];
// 	for (var i = 0; i < string.length; i++) {
// 		if ((string[i] + string[i + 1]) === doub) {
// 			indices.push(i);
// 		}
// 	}
// 	return indices;
// };
// //this function should check for a numerical sequence in an array
// function isSequence(array1, array2, string) {
// 	//make sure there's anything to check
// 	if (array1.length == 0 && array2.length == 0){
// 		return false;
// 	}
// 	//track variable, ummmmm, there's a reason for this, I know it...
// 	var track = 1;
// 	//holder for the array2.length
// 	var endThis = array2.length;
// 	//if "li" is indexed to Philip[3], then array2 needs to have 3, 4 because the sequence won't recognize that the doubled value counts
// 	//this loop pushes that
// 	for (var j = 0; j < endThis; j++) {
// 		array2.push(array2[j] + 1);
// 	}
// 	//compositeArray holds both array1 and 2
// 	var compositeArray = array1.concat(array2);
// 	//order them
// 	compositeArray = compositeArray.sort(function(a,b){return a - b});
// 	//sort them for doubles
// 	compositeArray = compositeArray.filter(function(item, pos, ary) {
//         return !pos || item != ary[pos - 1];
//     });
//     //this adds to track for each element that is equal to the next -1, ie sequential
// 	for(var i = 0; i < compositeArray.length - 1; i++) {
// 		if (compositeArray[i] == compositeArray[i + 1] - 1 && compositeArray[0] == 0) {
// 			track += 1;
// 		} else {
// 			track = -1;
// 		}
// 	}
// 	if (track == -1 || track < string.length) {
// 		return {
// 			val: false,
// 			spell: -1
// 		};
// 	} else {
// 		return {
// 			val: true,
// 			spell: compositeArray
// 		};
// 	}
// }
// document.getElementById("generate").onclick = function() {
// document.getElementById("output").innerHTML = "This is...!";
// //variables to hold some data
// var checksSing = [];
// var checksDoub = [];
// var indicesSing = [];
// var indicesDoub = [];
// var possibleSing = [];
// var possibleDoub = [];
// var out = [];
// var outDoub = [];
// var indicesOfPossible = [];
// var possibleConcat;
// var input = document.getElementById("userName");
// //actually manipulation of data
// 	//this loop looks for single letter matches and pushes to possibleSing
// 	for (var j = 0; j < input.value.length; j++) {
// 		checksSing.push(input.value.toLowerCase().slice(j, j + 1));
// 		indicesSing.push(elemArray.indexOf(checksSing[j]));
// 		if (indicesSing[j] >= 0) {
// 			possibleSing.push(elemArray[indicesSing[j]]);
// 		}
// 	}
// 	//this loop looks for double letter matches and pushes to possibleDoub
// 	for (var i = 1; i < input.value.length; i++) {
// 		checksDoub.push((checksSing[i - 1] + checksSing[i]));
// 		indicesDoub.push(elemArray.indexOf(checksDoub[i - 1]));
// 		if (indicesDoub[i -1] >= 0) {
// 			possibleDoub.push(elemArray[indicesDoub[i-1]]);
// 		} 
// 	}
// 	for (var z = 0; z < possibleSing.length; z++) {
// 		out.push(findIndices(input.value.toLowerCase(), possibleSing[z]))
// 	}
// 	for (var zz = 0; zz < possibleDoub.length; zz++) {
// 		outDoub.push(findDoubleIndices(input.value.toLowerCase(), possibleDoub[zz]));
// 	}
// 	if (out.length > 0) {
// 		out = out.reduce(function(a,b){return a.concat(b)});
// 	} else if (possibleSing[0] == -1) {
// 		document.getElementById("output").innerHTML = "You've entered a sequence of letters that literally doesn't have any elemental symbols in it!  Go you!";
// 	} else {
// 		document.getElementById("output").innerHTML = "How the *^&(&*^) (*&) did you get this message you *I^%((?!";
// 	}
// 	if (outDoub.length > 0) {
// 		outDoub = outDoub.reduce(function(a,b){return a.concat(b)});
// 	} else {
// 		outDoub = outDoub;
// 	}
// 	out = out.sort(function(a,b){return a - b});
// 	outDoub = outDoub.sort(function(a,b){return a - b});
// 	out = out.filter(function(item, pos, ary) {
//         return !pos || item != ary[pos - 1];
//     });
//     outDoub = outDoub.filter(function(item, pos, ary) {
//         return !pos || item != ary[pos - 1];
//     });
//     if (isSequence(out, outDoub, input.value).val) {
//     	document.getElementById("output").innerHTML = "This is possible!";
//     } else {
//     	document.getElementById("output").innerHTML = "This is not possible, sorry!";
//     }

//     possibleConcat = possibleSing.concat(possibleDoub);
//     for (var zzz = 0; zzz < possibleConcat.length; zzz++) {
//     	indicesOfPossible.push(elemArray.indexOf(possibleConcat[zzz]));
//     }
// };
