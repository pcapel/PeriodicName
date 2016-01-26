//cleaner ver of application

//need to figure out a more consisten implementation for this...
var Counter = function(set) {
	this.count = set;
};
Counter.prototype.get = function() {
			return this.count;
};
Counter.prototype.increment = function(fold) {
			return this.count += 1 * fold;
}
Counter.prototype.decrement = function() {
			return this.count--;
}
Counter.prototype.reset = function() {
			return this.count = 0;
};
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
		//singles will hold the single matches found for input and the original index of the letter that it was to match
		//example philip => [0, 14, 1, 1, 2, 54, 3, -1, 4, 54, 5, 14]
		singles : [],
		//doubles will follow suite with singles but contain a triple set for the two indexes that the match would replace
		//example philip => [0, 1, -1, 1, 2, -1, 2, 3, -1, 3, 4, 3, 4, 5, -1]
		doubles : [],
		first : [],
		second : []
	}
};
var controls = {
	init : function() {
		view.init();
		controls.counter = this.forCount();
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
	//takes a string and returns an array containing arrays of [string_index, string] pairs
	//example Philip becomes [[0, p], [1, h], [2, i], [3, l], [4, i], [5, p]]
	singlizeName : function(name) {
		for (var i = 0; i < name.length; i++) {
			model.name.singles.push(i, name.slice(i, i + 1));
		}
		return model.name.singles;
	},
	//takes a string and returns the sequential doubles of letters eg philip => ph, hi, il, etc
	//the array format is [[index of first, index of second, string pair], etc] such that ph would be:
	//[[0,1,"ph"]] thus conserving the positional information in the original string
	doublizeName : function(name) {
		for (var i = 1; i < (name.length * 2) - 1; i += 2) {
			model.name.doubles.push((i-1)/2, Math.ceil(i/2), model.name.singles[i] + model.name.singles[i + 2]);
		}
		return model.name.doubles;
	},
	//compares the model.name.singles/doubles to periodic table and pushes the index of matched items into an object
	//returns this object to be passed to another function
	compareToTable : function(arrayOfSingles, arrayOfDoubles) {
		var indexTracker = 0;
		var matches = {
			singles : [],
			doubles : []
		};
		for (var i = 0; i < arrayOfSingles.length; i += 2){
			matches.singles.push(arrayOfSingles[i], model.periodicTable.indexOf(arrayOfSingles[i + 1]));
		}
		for (var j = 2; j < arrayOfDoubles.length; j+=3) {
			matches.doubles.push(indexTracker, indexTracker + 1, model.periodicTable.indexOf(arrayOfDoubles[j]));
			indexTracker++;
		}
		return matches;
	},
	//takes in the object returned from compareToTable above
	//returns an array from the model that has only those sub-arrays where compare to table returned greater than 0
	arePossible : function(obj){
		var singles = obj.singles;
		var doubles = obj.doubles;
		var possible = model.name.possible;
		for (var i =0; i < singles.length; i++) {
			if (singles[i][1] > -1) {
				possible.push(singles[i]);
			}
		}
		for (var j = 0; j < doubles.length; j++) {
			if (doubles[j][1] > -1) {
				possible.push(doubles[j])
			}
		}
		return possible;
	},
	updateModel : function(object) {
		model.name.singles = object.singles;
		model.name.doubles = object.doubles;
	},
	spellCheck : {
		checkSingles : function(indexStart, callNumber) {
		//logic
			var tracker = controls.counter.get();
			var array = model.name.singles;
			for (var i = indexStart; i < array.length; i += 2) {
				if (array[i] > -1) {
					model.name[callNumber].push(array[i]);
					controls.counter.increment(1);
					return this.checkSingles(indexStart + 2, callNumber);
				} else if (array[i] == -1 && tracker == 0) {
					return false;
				} else if (array[i] == -1) {
					controls.counter.reset();
					return this.checkDoubles(i + Math.ceil(i/2), callNumber);
				}
			}
		},
		 checkDoubles : function(indexStart, callNumber) {
			//logic
			var tracker = controls.counter.get();
			var array = model.name.doubles;
			for (var i = indexStart; i < array.length; i += 3) {
				if (array[i] > -1) {
					model.name[callNumber].push(array[i]);
					controls.counter.increment(1);
					return this.checkSingles((i - Math.ceil(i/3)) + 4, callNumber);
				} else if (array[i] == -1 && tracker == 0) {
					return false;
				} else if (array[i] == -1) {
					controls.counter.reset();
					return this.checkSingles(indexStart - 1, callNumber); 
				}
			}
		}
	},
	validateSpelling : function(array, string) {
		var holder = [];
		var symbol;
		for (var i = 0; i < array.length; i++) {
			holder.push(model.periodicTable[array[i]]);
		}
		holder = holder.join("");
		console.log(holder);
		if (holder == string) {
			return true;
		} else {
			return false;
		}
	},
	validateDiff : function(array1, array2) {
		var holder1 = array1.join();
		var holder2 = array2.join();
		if (holder1 == holder2) {
			console.log("No difference");
			return false;
		} else {
			console.log("differences are present");
			return true;
		}
	},
	//gets the symbols that are possible for spelling the name
	//still will need something similar, but I don't know what this is doing right now
	grabSymbols : function(array) {
		var matches = model.possibleMatches;
		var table = model.periodicTable;
		var symbols = model.symbols;
		for (var i = 0; i < matches.length; i++) {
			symbols.push(table[matches[i]]);
		}
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
			//view.output.innerHTML = 
		}
	},
	eval : function() {
		$("#generate").on('click', function() {
			view.grabName(); //grab the name each time in case it changes
				var singles = controls.singlizeName(view.userInput); 
				var doubles = controls.doublizeName(view.userInput);
				var matches = controls.compareToTable(singles, doubles);
				controls.updateModel(matches);
				controls.spellCheck.checkSingles(1, "first");
				controls.spellCheck.checkDoubles(2, "second");
				console.log("model.name.first after call to spellCheck   ", model.name.first);
				console.log("model.name.second after call to spellCheck   ", model.name.second);
				console.log(controls.validateSpelling(model.name.first, view.userInput));
				console.log(controls.validateSpelling(model.name.second, view.userInput));
				console.log(controls.validateDiff(model.name.first, model.name.second));
				controls.clearHolders();
		});
	}

};

controls.init();


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
