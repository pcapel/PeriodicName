//cleaner vs of application
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
		//singles array holds arrays with [x][0] being the original character position,
		//[x][1] is the matched index in the periodicTable
		//example p, h, i, l, i, p would be [[0,14],[1,0],[2,52]] etc
		singles : [],
		//same logic as above would apply, only the array would contain the index of both letters the double could represent
		//eg [[0,1,-1][1,2,-1][2,3,-1][3,4,2]] would be the same as ph, hi, il, li with [x][2] telling if there's a match
		doubles : [],
		//possible will be a holder for the arrays in singles and doubles that hold possible values
		//meaning that singles[x][1] != -1 and doubles[x][2] != -1
		possible : []
	}
};
var controls = {
	init : function() {
		view.init();
	},
	//takes a string and returns an array containing arrays of [string_index, string] pairs
	//example Philip becomes [[0, p], [1, h], [2, i], [3, l], [4, i], [5, p]]
	singlizeName : function(name) {
		for (var i = 0; i < name.length; i++) {
			model.name.singles.push([i, name.slice(i, i + 1)]);
		}
		return model.name.singles;
	},
	//takes a string and returns the sequential doubles of letters eg philip => ph, hi, il, etc
	//the array format is [[index of first, index of second, string pair], etc] such that ph would be:
	//[[0,1,"ph"]] thus conserving the positional information in the original string
	doublizeName : function(name) {
		for (var i = 1; i < name.length; i++) {
			model.name.doubles.push([[i - 1, i], model.name.singles[i - 1][1] + model.name.singles[i][1]]);
		}
		return model.name.doubles;
	},
	//compares the model.name.singles/doubles to periodic table and pushes the index of matched items into an object
	//returns this object to be passed to another function
	compareToTable : function(arrayOfSingles, arrayOfDoubles) {
		var matches = {
			singles : [],
			doubles : []
		};
		for (var i = 0; i < arrayOfSingles.length; i++){
			matches.singles.push([i, model.periodicTable.indexOf(arrayOfSingles[i][1])]);
		}
		for (var j = 0; j < arrayOfDoubles.length; j++) {
			matches.doubles.push([[j, j + 1], model.periodicTable.indexOf(arrayOfDoubles[j][1])]);
		}
		//**************I want to remember this logic, but it isn't useful with my new method***************
		// //neat logic here because the array.length property is being modified
		// //remember that the for loop needs the ";" after the final argument to be valid
		// for (var k = matches.length; k--;) {
		// 	if (matches[k] < 0) {
		// 		matches.splice(k, 1);
		// 	}
		// }
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
	//takes an array and searches it from index 0 and returns an array containg the holes it finds between values
	//example array passed [1, 2, 4, 5] tracker outputs [3], if input is [3,4,6] with a string.length of 7 output is [0, 1, 2, 5] :3
	//does run into issue when the hole is larger than a single position
	//******************************needs revision*****************************
	findHoles : function(array, string) {
		var tracker = [];
		if (array.length == string.length) {
			return tracker;
		} else {
			//handles situations where the first letters of the string are not represented
			//eg Aaron
			for (var i = array[0] - 1; i >= 0; i--) {
				tracker.unshift(i);
			}
			for (var j = 0; j < array.length; j++) {
				if (array[j] == array[j + 1] -1 || array[j + 1] == undefined) {

				} else {
					tracker.push(array[j + 1] -1);
				}
			}
		}
		return tracker;
	},
	//takes in two arrays, the first is the holes and the second is the doubles
	//checks holes against doubles to say whether or not there's a way to replace things that allow gaps with a double 
	checkHoles : function(array, array2) {
		var canFillAt = [];
		for (var i = 0; i < array2.length; i++) {
			canFillAt.push(array[array.indexOf(array2[i][0])]);
		}
		return canFillAt;
	},
	//as in the verb legitimate not the noun.
	//checks to see if the possible fill will break the proper spelling by creating a gap
	//example NaCaCu could also be NAcAcU...oh *(&^.  This isn't addressed by my program at all...
	//I can probably write this function to do that
	//******************************************************Do this*******************************************************
	legitimateFill : function(array, array2) {

	},
	//object containing methods relevant to this subset of functionality
	canSpell : {
		//*********************************These functions are NOT DRY, but I wanted to get them working before I pulled out the functionality that they share*************************************

		//pass in model.name.possible and pull out arrays that have .length == 2 and a string to match to
		//checks to see if the input can be spelled with only single letter elements
		//ie if the sequence of single matches is both sequential (with respect to the string input) and the right length according to input string
		withSingles : function(array, string) {
			var holder = [];
			//this can probably be abstracted to it's own function
			//tentatively called *pullFromNested
			for (var i = 0; i < array.length; i++) {
				if (array[i].length == 2 && typeof array[i][0] == "number") {
					holder.push(array[i][0]);
				}
			}
			//*
			if (holder[0] > 0) {
				return false;
			}
			if (string.length == holder.length){
				return true;
			} else {
				return false;
			}
		},
		//takes in the model.name.possible and pulls out arrays that have .length == 3 and the string to match to
		//fills holder with the arrays that have arrays in them then flattens them and sorts out doubled values
		//compares to the input string for length, which will return true or false 
		withDoubles : function(array, string) {
			var holder = []; 
			var metaHolder = [];
			//here's that same sort of logic for *pullFromNested
			//it might take passing the level you want to pull from or something similar
			for (var i = 0; i < array.length; i++) {
				if (array[i].length == 2 && typeof array[i][0] == "object") {
					holder.push(array[i][0]);
				}
			}
			//*
			//this can DEFINITELY become its own method
			//call it *flattenFilter or something
			holder = Array.prototype.concat.apply([], holder);
			holder = holder.filter(function(item, pos, ary) {
         		return !pos || item != ary[pos - 1];
     		});
     		//*
			if(holder.length == string.length){
				return true;
			} else {
				return false;
			}
		},
		mixedVariant : function(array, string) {
			var holderSingle = [];
			var holderDouble = [];
			var holes;
			//look familiar?
			//* pullFromNested
			for (var i = 0; i < array.length; i++) {
				if (array[i].length == 2 && typeof array[i][0] == "number") {
					holderSingle.push(array[i][0]);
				}
			}
			for (var j = 0; j < array.length; j++) {
				if (array[j].length == 2 && typeof array[j][0] == "object") {
					holderDouble.push(array[j][0]);
				}
			}
			//*
			//look through holder single for the spots that it needs something to fill in
			holes = controls.findHoles(holderSingle, string);
			//check to see if any of the doubles match up to holes
			console.log("Holes   ", holes);
			console.log("Can Fill At  ", controls.checkHoles(holes, holderDouble));
			console.log("    ", holderSingle, "     ", holderDouble);
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
		model.name.possible = [];
	}
};
var view = {
	init : function() {
		this.output = $("#output");
		this.genName = $("#generatedName");
		this.eval();
	},
	grabName : function() {
		var name = $("#userName");
		this.userInput = name.value.toLowerCase();
	},
	eval : function() {
		$("#generate").on('click', function() {
			view.grabName(); //grab the name each time in case it changes
			var singles = controls.singlizeName(view.userInput); 
			var doubles = controls.doublizeName(view.userInput);
			var matches = controls.compareToTable(singles, doubles);
			console.log("Matches  ", matches);
			var possible = controls.arePossible(matches);
			console.log("Test of withSingles   ",controls.canSpell.withSingles(possible, view.userInput));
			console.log("Test of withDoubles   ",controls.canSpell.withDoubles(possible, view.userInput));
			console.log("Test of mixedVariant   ",controls.canSpell.mixedVariant(possible, view.userInput));
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


//things that I would like to implement eventually:
//1: Actually getting the spelling to work.
//2: ajax call after the check for possibility to pull the required images for the spell