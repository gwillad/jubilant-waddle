declare function require(name:string);
var fs = require('fs');

import * as readline from 'readline'; 
import * as process from 'process';

enum GoodType 
{
	candy,
	popcorn,
	coffee,
	other
}

class Good 
{
	public static BasicSalesTax: number = 0.1;
	public static ImportDutyTax: number = 0.05;
	
	private __name: string;
	private __cost: number; 
	private __goodType: GoodType;
	private __isImported: boolean;
	private __quantity: number;
	
	private __totalTax: number;
	
	public get name(): string 
	{
		return this.__name;
	}
	
	public get cost(): number 
	{
		return this.__cost;
	}
	
	public get goodType(): GoodType 
	{
		return this.__goodType;
	}
	
	public get isImported(): boolean
	{
		return this.__isImported;
	}
	
	public get quantity(): number 
	{
		return this.__quantity;
	}
	
	public get totalTax(): number
	{
		return this.__totalTax;
	}
	
	public get adjustedCost(): number
	{
		return this.__cost + this.__totalTax;
	}
	
	public constructor(name: string, cost: number, goodType: GoodType, isImported: boolean, quantity: number) 
	{
		this.__name = name;
		this.__cost = cost;
		this.__goodType = goodType;
		this.__isImported = isImported;
		this.__quantity = quantity;
		this.__calculateTotalTax();
	}
	
	public static ParseBasket(input: string): Good 
	{
		// should be of the form {quantity} {imported} {good} at {price}
		// not sure how to address erroneous entry. 
		const inputArray = input.split(" ");
		const quantity = Number(inputArray[0].split(",").join("")); //not localized
		const isImported = inputArray[1].toLowerCase() === "imported"; 
		let start = (isImported ? 2 : 1);
		let end = start;
		for (; end < inputArray.length; end++) 
		{
			if (inputArray[end] === "at")
			{
				break;
			}
		}
		const name = inputArray.slice(start, end).join(" ");
		const goodType = Good.ParseGoodType(name);
		const cost = Number(inputArray.pop().split(",").join("")); //not localized
		
		return new Good(name, cost, goodType, isImported, quantity);
	}
	
	public static ParseGoodType(name: string): GoodType
	{
		const lastWord = name.split(" ").pop().toLowerCase();
		switch (lastWord) {
			case "skittles":
			case "snickers":
				return GoodType.candy;
			case "coffee":
				return GoodType.coffee;
			case "popcorn":
				return GoodType.popcorn;
			default: 
				return GoodType.other;
		}
	}
	
	private __calculateTotalTax(): void
	{
		this.__totalTax = 0;
		if (this.__goodType === GoodType.other) 
		{
			this.__totalTax += Good.__roundTo5Cents(this.__cost * Good.BasicSalesTax);
		}
		if (this.__isImported) 
		{
			this.__totalTax += Good.__roundTo5Cents(this.__cost * Good.ImportDutyTax);
		}
	}
	
	private static __roundTo5Cents(unrounded: number) : number 
	{
		return Math.ceil(unrounded*20)*.05;
	}
}

class OutputHandler 
{	public static PrintOutput(goodList: Good[]): void 
	{
		let salesTaxTotal = 0;
		let total = 0;
	
		for (const good of goodList) 
		{
			console.log(`${good.quantity.toLocaleString()} ${(good.isImported?"imported ":"")}${good.name}: ${good.adjustedCost.toLocaleString()}`);
			salesTaxTotal += good.totalTax;
			total += good.adjustedCost;
		}
	
		console.log(`Sales Tax: ${salesTaxTotal.toLocaleString()}`);
		console.log(`Total: ${total.toLocaleString()}`);
	}
}
	
let goodList: Good[] = [];

let getFn = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

getFn.write("Enter input text filename\n");
getFn.on("line", (input) => {
	if (input !== "") {
		let rl = readline.createInterface({
			input: fs.createReadStream(input),
			output: process.stdout
		});

		rl.on("line", (input) => {
			if (input === "") 
			{
				OutputHandler.PrintOutput(goodList);
				goodList = [];
				console.log();
			} else {
				goodList.push(Good.ParseBasket(input)); 
			}
		}); 

		rl.on("close", () => {
			console.log("\n");
			OutputHandler.PrintOutput(goodList);
			goodList = [];
		});
	}
	getFn.close();
});