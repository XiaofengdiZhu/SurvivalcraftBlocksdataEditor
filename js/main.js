var log_div = $("#log_div");
function outputLog(log){
  var object_Date = new Date();
  log_div.append("<div class='log_p'>" + object_Date.getHours() + ":" + object_Date.getMinutes() + ":" + object_Date.getSeconds() + " " + object_Date.getMilliseconds() + "ms " + log + "</div>");
  log_div.scrollTop(log_div[0].scrollHeight);
}

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
  outputLog("来自base64编码函数：输入的Blocksdata字符串base64编码成功")
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
			outputLog("来自选择文件：开始载入文件" + file.name + "，大小：" + file.size + "B");
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function() {
			if(this.result[0] == "C"){
				Blocksdata_string = this.result;
				outputLog("来自选择文件：文件" + file.name + "载入成功");
			}else outputLog("来自选择文件：文件" + file.name + "载入失败，请确认该文件是一个Blocksdata文件");
		};
		reader.onabort = function(){
			outputLog("来自选择文件：文件" + file.name + "载入中断");
		};
		reader.onerror = function(){
			outputLog("来自选择文件：文件" + file.name + "载入错误");
		};
	}
}

var analyzeStartTime = 0;
var Blocks_array = new Array();
var Blockname_array = new Array();
var Blocks_amount = 0;
var Blocksdata_array = new Array();
var Data_amount = 0;
var Dataname_array = new Array();
var Data_name2index = {};
//var Blocksdata_json = {};
var Block_name2index = {};
var Block_cant_edit = new Array();
Block_cant_edit[0] = 0;
var BlocksWithDuration = new Array();
var isOutputDetailAnalizeLog = false;

//初始化
function analizeBlocksdata_initiate() {
	analyzeStartTime = new Date().getTime();
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
	BlocksWithDuration = new Array();
	isOutputDetailAnalizeLog = false;
	outputLog("来自Blocksdata解析：解析初始化完成");
}

function analizeBlocksdata() {
	analizeBlocksdata_initiate();
	if(Blocksdata_string === ""){
		outputLog("来自Blocksdata解析：未检测到Blocksdata文件");
		return;
	}
	Blocks_array = Blocksdata_string.split("\r\n"); //分割行
	Blocks_amount = Blocks_array.length;
	if (Blocks_amount === 0) {
		outputLog("来自Blocksdata解析：请确认载入的文件是一个Blocksdata文件");
		analizeBlocksdata_initiate();
		return;
	}
	$("#block_min").attr("max",Blocks_amount);
	$("#block_max").attr("max",Blocks_amount);
	$("#block_max_display").text(Blocks_amount);
	outputLog("来自Blocksdata解析：方块数量："+ Blocks_amount);
	if($("#isOutputDetailAnalizeLog")[0].checked)isOutputDetailAnalizeLog = true;
	//对每一行进行操作
	for (var i = 0, k = 0; i < Blocks_amount; i++) {
		Blocksdata_array[i] = Blocks_array[i].split(";"); //分割分号
		if (i === 0) {
			Data_amount = Blocksdata_array[0].length;
			if (Data_amount === 0) {
				outputLog("来自Blocksdata解析：请确认载入的文件是一个Blocksdata文件");
				analizeBlocksdata_initiate();
				return;
			}
			if (Blocksdata_array[0][0] == "Class Name") Blocksdata_array[0][0] = "ClassName";
			outputLog("来自Blocksdata解析：每行分号数量：" + (Data_amount-1));
		}
		if (i < Blocks_amount - 1 && Blocksdata_array[i].length != Data_amount) {
			outputLog("来自Blocksdata解析：第" + (i + 1) + "行分号数量：" + (Blocksdata_array[i].length-1) + ",不等于" + (Data_amount-1));
			analizeBlocksdata_initiate();
			return;
		}
		//跳过只有分号的空行
		if (Blocksdata_array[i][0] === ""){
			Block_cant_edit[Block_cant_edit.length] = i;
			if(isOutputDetailAnalizeLog)outputLog("来自Blocksdata解析：第" + (i + 1) + "行是空行");
			continue;
		}
		if(Blocksdata_array[i][Data_name2index["Durability"]] != "-1"){
			BlocksWithDuration[BlocksWithDuration.length] = i;
			if(isOutputDetailAnalizeLog)outputLog("来自Blocksdata解析：第" + (i + 1) + "行" + Blocksdata_array[i][0] + "具有耐久度");
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
				Data_name2index[Dataname_array[j]] = j;
				$("#selectData").append("<option>" + Dataname_array[j] + "</option>");
				$("#selectData1").append("<option>" + Dataname_array[j] + "</option>");
			}
		}
	}
	if(isOutputDetailAnalizeLog)outputLog("共有" + Block_cant_edit.length + "个空行，" + BlocksWithDuration.length + "个方块具有耐久度");
	outputLog("来自Blocksdata解析：文件解析成功，历时" + (new Date().getTime()-analyzeStartTime) + "ms");
}

function changeBlockData_byName(BlockName, DataName, new_BlockData){
	Blocksdata_array[Block_name2index[BlockName]][Data_name2index[DataName]] = new_BlockData;
  outputLog("来自根据名字修改Blocksdata函数：已修改" + BlockName + "的" + DataName + "为" + new_BlockData);
}

var selectedBlock_trueIndex = 0;
var selectedData_trueIndex = 0;

function selectChanged() {
	//selectedBlock_trueIndex = eval("Block_name2index." + Blockname_array[$("#selectBlock")[0].options.selectedIndex]);
	selectedBlock_trueIndex = Block_name2index[Blockname_array[$("#selectBlock")[0].options.selectedIndex]];
	selectedData_trueIndex = $("#selectData")[0].options.selectedIndex;
	$("#BlockData").val(Blocksdata_array[selectedBlock_trueIndex][selectedData_trueIndex]);
  outputLog("来自单方块编辑：选择已更新，现在选择的是：" + Blocksdata_array[selectedBlock_trueIndex][0] + " " + Dataname_array[selectedData_trueIndex] + "，当前值是：" + Blocksdata_array[selectedBlock_trueIndex][selectedData_trueIndex]);
}

function saveChange() {
	if(Block_cant_edit.indexOf(selectedBlock_trueIndex) > -1){
		outputLog("来自单方块编辑：不能修改第1行和只有分号的空行");
		return;
	}
	Blocksdata_array[selectedBlock_trueIndex][selectedData_trueIndex] = $("#BlockData").val();
  outputLog("来自单方块编辑：已将" + Blocksdata_array[selectedBlock_trueIndex][0] + "的" + Dataname_array[selectedData_trueIndex] + "修改为" + Blocksdata_array[selectedBlock_trueIndex][selectedData_trueIndex]);
}

var block_min = 1;
var block_max = 1;
var selectedData1_trueIndex = 0;

function block_min_Changed(){
	block_min = $("#block_min").val();
	if(block_min > (Blocks_amount===0?1:Blocks_amount)){
		block_min = Blocks_amount===0?1:Blocks_amount;
  	block_max = block_min;
		$("#block_min").val(block_min);
    $("#block_max").val(block_max);
    outputLog("来自批量编辑：行数范围最小值不能大于总行数，已将行数范围最小值和行数范围最大值设为总行数" + (Blocks_amount===0?1:Blocks_amount));
    return;
	}
  if(block_max < block_min){
    block_max = block_min;
    $("#block_max").val(block_max);
    outputLog("来自批量编辑：行数范围最小值大于行数范围最大值，已将行数范围最大值设为行数范围最小值" + block_min);
    return;
  }
	if(block_min < 1){
		block_min = 1;
		$("#block_min").val("1");
    outputLog("来自批量编辑：行数范围最小值不能小于1，已将行数范围最小值设为1");
		return;
	}
  outputLog("来自批量编辑：行数范围最小值已更新，现在值是：" + block_min);
}

function block_max_Changed(){
	block_max = $("#block_max").val();
	if(block_max < block_min){
		block_max = block_min;
		$("#block_max").val(block_max);
    outputLog("来自批量编辑：行数范围最大值不能小于行数范围最小值，已将行数范围最大值设为行数范围最小值" + block_min);
		return;
	}
	if(block_max > (Blocks_amount===0?1:Blocks_amount)){
		block_max = Blocks_amount===0?1:Blocks_amount;
		$("#block_max").val(block_max);
    outputLog("来自批量编辑：行数范围最大值不能大于总行数，已将行数范围最大值设为总行数" + (Blocks_amount===0?1:Blocks_amount));
		return;
	}
  outputLog("来自批量编辑：行数范围最大值已更新，现在值是：" + block_max);
}

function selectAllBlocks(){
	block_min = 1;
	$("#block_min").val(block_min);
	block_max = Blocks_amount===0?1:Blocks_amount;
	$("#block_max").val(block_max);
  outputLog("来自批量编辑：已选择所有行：" + block_min + "-" + block_max + "行");
}

function selectChanged1(){
	selectedData1_trueIndex = $("#selectData1")[0].options.selectedIndex;
	$("#BlockData1").val(Blocksdata_array[block_min-1][selectedData1_trueIndex]);
  outputLog("来自批量编辑：属性选择已更新，现在选择的是" + Dataname_array[selectedData1_trueIndex] + "，选中范围内第一个方块的该属性值是：" + Blocksdata_array[block_min-1][selectedData1_trueIndex]);
}

var BlockData1 = "";

function saveChange1() {
  outputLog("来自批量编辑：开始批量修改并保存");
	BlockData1 = $("#BlockData1").val();
	for(var i = block_min - 1; i < block_max; i++){
		if(Block_cant_edit.indexOf(selectedBlock_trueIndex) > -1 || ($("#isSkipBlocksWithDuration")[0].checked && BlocksWithDuration.indexOf(selectedBlock_trueIndex) == -1))continue;
		Blocksdata_array[i][selectedData1_trueIndex] = BlockData1;
	}
  outputLog("来自批量编辑：保存成功，已跳过第一行、" + Block_cant_edit.length + "行空行" + ($("#isSkipBlocksWithDuration")[0].checked?("和" + BlocksWithDuration.length +"行有耐久度的方块行"):""));
}

var clipboard = new Clipboard('#btn_copy', {
    text: function(trigger) {
        return Blocksdata_string_new;
    }
});

clipboard.on('success', function(e) {
    outputLog("来自复制到剪贴板：复制成功");
    e.clearSelection();
});

clipboard.on('error', function(e) {
	clipboard_isSupported = false;
	$("#btn_copy").html("<del>复制到剪贴板</del>");
	$("#btn_copy").attr("disabled","disabled");
	$("#textarea_blocksdata").show();
	$("#textarea_blocksdata").val(Blocksdata_string_new);
    outputLog("来自复制到剪贴板：复制失败，已输出到底部文本框");
});
var clipboard_isSupported = Clipboard.isSupported();
if(clipboard_isSupported){
	$("#btn_copy").html("复制到剪贴板");
	$("#btn_copy").removeAttr("disabled");
	$("#textarea_blocksdata").hide();
}else outputLog("来自复制到剪贴板：你的浏览器不支持此功能");

var Blocks_array_new = new Array();
var Blocksdata_string_new = "";

function generateNewBlocksdata() {
  outputLog("来自生成新Blocksdata：开始生成新的Blocksdata");
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
  outputLog("来自生成新Blocksdata：生成新的Blocksdata字符串成功");
	$("#a_save").attr("href", generateDataURL(Blocksdata_string_new));
  outputLog("来自生成新Blocksdata：生成新的Blocksdata文件成功，现在可以下载");
  if(!clipboard_isSupported){
	$("#textarea_blocksdata").val(Blocksdata_string_new);
	outputLog("来自生成新Blocksdata：新的Blocksdata已输出到文本框，可全选复制");
  }
}

function BedrockComprehensiveMod(){
  changeBlockData_byName("BedrockBlock","IsPlaceable","TRUE");
  changeBlockData_byName("BedrockBlock","IsGatherable","TRUE");
  changeBlockData_byName("BedrockBlock","DefaultCreativeData","0");
  changeBlockData_byName("BedrockBlock","DigResilience","0");
  outputLog("来自基岩综合：基岩综合应用并保存成功");
}

outputLog("来自网页：主程序加载完毕，这里是日志输出");
