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
		singles : [],
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
	singlizeName : function(name) {
		for (var i = 0; i < name.length; i++) {
			model.name.singles.push(name.slice(i, i + 1));
		}
		return model.name.singles;
	},
	doublizeName : function(name) {
		for (var i = 0; i < name.length - 1; i++) {
			model.name.doubles.push(model.name.singles[i] + model.name.singles[i + 1]);
		}
		return model.name.doubles;
	},
	compareToTable : function(arrayOfSingles, arrayOfDoubles) { 
		var matches = {
			singles : [],
			doubles : []
		}; 
		for (var i = 0; i < arrayOfSingles.length; i++){
			matches.singles.push(model.periodicTable.indexOf(arrayOfSingles[i]));
		}
		for (var j = 0; j < arrayOfDoubles.length; j++) {
			matches.doubles.push(model.periodicTable.indexOf(arrayOfDoubles[j]));
		}
		matches.doubles.push(-1);
		return matches;
	},
	updateModel : function(object) { 
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
	grabPeriodicObjects : function(array) {
		var holder = this.holdValues(array);
		var periodicObjects = {};
		for (var i = 0; i < holder.length; i++) {
			periodicObjects[i] = periodicObject[holder[i]];
		}
		return periodicObjects;
	},
	clearHolders : function() {
		model.name.singles = [];
		model.name.doubles = [];
		model.name.first = [];
		model.name.second = [];
	}
};
var view = {
	init : function() {
		this.eval();
		this.updateWith.clear();
	},
	grabName : function() {
		var name = $("#userName")[0];
		this.userInput = name.value.toLowerCase();
	},
	updateWith : {
		notName : function() {
			//fill with logic to check that only valid characters are entered
		},
		notPossible : function() {
			var options = controls.holdOptions();
			var firstObjects, secondObjects;
			if (!controls.validateSpelling(options.first, view.userInput) &&
				!controls.validateSpelling(options.second, view.userInput)) {
				$("#output").append("<p>Sorry, that won't work!</p>");
			}
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
				$("#generatedName").empty();
			});
		}
	},
	eval : function() {
		$("#generate").on('click', function() {
				view.grabName(); 
				var singles = controls.singlizeName(view.userInput); 
				var doubles = controls.doublizeName(view.userInput);
				var matches = controls.compareToTable(singles, doubles);
				controls.updateModel(matches);
				controls.counter.reset();
				controls.spellCheck.checkDoubles(0, "second");
				controls.validateDiff(model.name.first, model.name.second);
				$("#output").empty();
				view.updateWith.spelledOptions();
				view.updateWith.notPossible();
				controls.clearHolders();
		});
	}
};
controls.init();
