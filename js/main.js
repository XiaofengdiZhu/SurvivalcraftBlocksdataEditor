var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

function base64encode(str) {
	var out, i, len;
	var c1, c2, c3;
	len = str.length;
	i = 0;
	out = "";
	while (i < len) {
		c1 = str.charCodeAt(i++) & 0xff;
		if (i == len) {
			out += base64EncodeChars.charAt(c1 >> 2);
			out += base64EncodeChars.charAt((c1 & 0x3) << 4);
			out += "==";
			break;
		}
		c2 = str.charCodeAt(i++);
		if (i == len) {
			out += base64EncodeChars.charAt(c1 >> 2);
			out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			out += base64EncodeChars.charAt((c2 & 0xF) << 2);
			out += "=";
			break;
		}
		c3 = str.charCodeAt(i++);
		out += base64EncodeChars.charAt(c1 >> 2);
		out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
		out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
		out += base64EncodeChars.charAt(c3 & 0x3F);
	}
	return out;
}

function generateDataURL(str) {
	return "data:text/plain;base64,".concat(base64encode(str));
}
var selectBlock = $("#selectBlock");
var selectData = $("#selectData");
var Blocksdata_string = "";

function inputFiles(files) {
	if (files.length) {
		var file = files[0];
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function() {
			Blocksdata_string = this.result;
		};

	}
}

var Blocks_array = new Array();
var Blockname_array = new Array();
var Blocks_amount = 0;
var Blocksdata_array = new Array();
var Data_amount = 0;
var Dataname_array = new Array();
//var Blocksdata_json = {};
var Block_name2index = {};
var Block_cant_edit = new Array();
Block_cant_edit[0] = 0;

//初始化
function analizeBlocksdata_initiate() {
	Blocksdata_array = new Array();
	//Blocksdata_json = {};
	Block_name2index = {};
	$("#selectBlock").empty();
	$("#selectData").empty();
	$("#BlockData").val("");
	$("#block_min").attr({"max":"1","value":"1"});
	$("#block_max").attr({"max":"1","value":"1"});
	Block_cant_edit = new Array();
	Block_cant_edit[0] = 0;
}

function analizeBlocksdata() {
	analizeBlocksdata_initiate();
	Blocks_array = Blocksdata_string.split("\r\n"); //分割行
	Blocks_amount = Blocks_array.length;
	if (Blocks_amount === 0) {
		analizeBlocksdata_initiate();
		alert("请检查文件");
		return;
	}
	$("#block_min").attr("max",Blocks_amount);
	$("#block_max").attr("max",Blocks_amount);
	$("#block_max_display").text(Blocks_amount);
	//对每一行进行操作
	for (var i = 0, k = 0; i < Blocks_amount; i++) {
		Blocksdata_array[i] = Blocks_array[i].split(";"); //分割分号
		if (i === 0) {
			Data_amount = Blocksdata_array[0].length;
			if (Data_amount === 0) {
				analizeBlocksdata_initiate();
				alert("请检查文件");
				return;
			}
			if (Blocksdata_array[0][0] == "Class Name") Blocksdata_array[0][0] = "ClassName";
		}
		if (i < Blocks_amount - 1 && Blocksdata_array[i].length != Data_amount) {
			analizeBlocksdata_initiate();
			alert("第" + (i + 1) + "行分号数量有误");
			return;
		}
		//跳过只有分号的空行
		if (Blocksdata_array[i][0] === ""){
			Block_cant_edit[Block_cant_edit.length] = i;
			continue;
		}
		//方块名称相关
		Blockname_array[k] = Blocksdata_array[i][0];
		$("#selectBlock").append("<option>" + Blockname_array[k] + "</option>");
		//Blocksdata_json[Blockname_array[k]]={};
		Block_name2index[Blockname_array[k]] = i;
		k++;
		//对每个分号间内容进行操作
		for (var j = 0; j < Data_amount; j++) {
			//Blocksdata_json[Blocksdata_array[i][0]][Blocksdata_array[0][j]] = Blocksdata_array[i][j];
			//对第一行的每个分号间内容进行操作，属性名称相关
			if (i === 0) {
				Dataname_array[j] = Blocksdata_array[0][j];
				$("#selectData").append("<option>" + Dataname_array[j] + "</option>");
				$("#selectData1").append("<option>" + Dataname_array[j] + "</option>");
			}
		}
	}
}

var selectedBlock_trueIndex = 0;
var selectedData_trueIndex = 0;

function selectChanged() {
	//selectedBlock_trueIndex = eval("Block_name2index." + Blockname_array[$("#selectBlock")[0].options.selectedIndex]);
	selectedBlock_trueIndex = Block_name2index[Blockname_array[$("#selectBlock")[0].options.selectedIndex]];
	selectedData_trueIndex = $("#selectData")[0].options.selectedIndex;
	$("#BlockData").val(Blocksdata_array[selectedBlock_trueIndex][selectedData_trueIndex]);
}

function saveChange() {
	if(Block_cant_edit.indexOf(selectedBlock_trueIndex) > -1){
		alert("不能修改第1行和只有分号的空行");
		return;
	}
	Blocksdata_array[selectedBlock_trueIndex][selectedData_trueIndex] = $("#BlockData").val();
}

var block_min = 1;
var block_max = 1;
var selectedData1_trueIndex = 0;

function block_min_Changed(){
	block_min = $("#block_min").val();
	if(block_min > (Blocks_amount===0?1:Blocks_amount)){
		block_min = Blocks_amount===0?1:Blocks_amount;
		$("#block_min").val(block_min);
	}
	if(block_max < block_min){
		block_max = block_min;
		$("#block_max").val(block_max);
		return;
	}
	if(block_min < 1){
		block_min = 1;
		$("#block_min").val("1");
		return;
	}
}

function block_max_Changed(){
	block_max = $("#block_max").val();
	if(block_max < block_min){
		block_max = block_min;
		$("#block_max").val(block_max);
		return;
	}
	if(block_max > (Blocks_amount===0?1:Blocks_amount)){
		block_max = Blocks_amount===0?1:Blocks_amount;
		$("#block_max").val(block_max);
		return;
	}
}

function selectAllBlocks(){
	block_min = 1;
	$("#block_min").val(block_min);
	block_max = Blocks_amount===0?1:Blocks_amount;
	$("#block_max").val(block_max);
}

function selectChanged1(){
	selectedData1_trueIndex = $("#selectData1")[0].options.selectedIndex;
	$("#BlockData1").val(Blocksdata_array[block_min-1][selectedData1_trueIndex]);
}

var BlockData1 = "";

function saveChange1() {
	BlockData1 = $("#BlockData1").val();
	for(var i = block_min - 1; i < block_max; i++){
		if(Block_cant_edit.indexOf(selectedBlock_trueIndex) > -1)continue;
		Blocksdata_array[i][selectedData1_trueIndex] = BlockData1;
	}
}

var Blocks_array_new = new Array();
var Blocksdata_string_new = "";

function generateNewBlocksdata() {
	Blocks_array_new = new Array();
	for (var i = 0; i < Blocks_amount; i++) {
		if (i === 0) {
			Blocksdata_array[0][0] = "Class Name";
			Blocks_array_new[0] = Blocksdata_array[0].join(";");
			Blocksdata_array[0][0] = "ClassName";
			continue;
		}
		Blocks_array_new[i] = Blocksdata_array[i].join(";");
	}
	Blocksdata_string_new = Blocks_array_new.join("\r\n");
	$("#a_save").attr("href", generateDataURL(Blocksdata_string_new));
}
