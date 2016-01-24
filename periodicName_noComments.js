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
		singles : [],
		doubles : [],
		possible : []
	}
};
var controls = {
	init : function() {
		view.init();
	},
	singlizeName : function(name) {
		for (var i = 0; i < name.length; i++) {
			model.name.singles.push([i, name.slice(i, i + 1)]);
		}
		return model.name.singles;
	},
	doublizeName : function(name) {
		for (var i = 1; i < name.length; i++) {
			model.name.doubles.push([[i - 1, i], model.name.singles[i - 1][1] + model.name.singles[i][1]]);
		}
		return model.name.doubles;
	},
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
		return matches;
	},
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
	findHoles : function(array, string) {
		var tracker = [];
		if (array.length == string.length) {
			return tracker;
		} else {
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
	checkHoles : function(array, array2) {
		var canFillAt = [];
		for (var i = 0; i < array2.length; i++) {
			canFillAt.push(array[array.indexOf(array2[i][0])]);
		}
		return canFillAt;
	},
	legitimateFill : function(array, array2) {

	},
	canSpell : {
		withSingles : function(array, string) {
			var holder = [];
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
		withDoubles : function(array, string) {
			var holder = []; 
			var metaHolder = [];
			for (var i = 0; i < array.length; i++) {
				if (array[i].length == 2 && typeof array[i][0] == "object") {
					holder.push(array[i][0]);
				}
			}
			holder = Array.prototype.concat.apply([], holder);
			holder = holder.filter(function(item, pos, ary) {
         		return !pos || item != ary[pos - 1];
     		});
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
			holes = controls.findHoles(holderSingle, string);
			console.log("Holes   ", holes);
			console.log("Can Fill At  ", controls.checkHoles(holes, holderDouble));
			console.log("    ", holderSingle, "     ", holderDouble);
		}
	},
	grabSymbols : function(array) {
		var matches = model.possibleMatches;
		var table = model.periodicTable;
		var symbols = model.symbols;
		for (var i = 0; i < matches.length; i++) {
			symbols.push(table[matches[i]]);
		}
	},
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
