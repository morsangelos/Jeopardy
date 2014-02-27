function DisplayAnswer()
{
    if (currentCluePopup == null) return;
    if (currentClueNode == null) return;

    var box = currentCluePopup;
    var clueContainer = box.find(".clue");
    var answerContainer = box.find(".answer");

    clueContainer.css("display", "none");
    answerContainer.css("display", "inline");
    
    var audio = clueContainer.find("audio");
    if (audio.length > 0)
    {
        audio[0].pause();
    }
    
    currentClueNode.children().addBack().filter(".container").text("");
}

var numberCategories;
function PopulateTable()
{
    var categories = $(".category-name");
    numberCategories = categories.length;
    $("#board .clue-row.header").each(
    function (index, value) {
        var cellTemplate = $("#header-template");
        categories.each(
        function (i) {
            var cell = cellTemplate.clone()
            var cellValue = $("#category" + (i + 1) + "-name").clone();
            cell.children(".container").append(cellValue);
            $(value).append(cell);
        });
    });
    $("#board .clue-row:not(.header)").each(
    function (index, value) {
        var cellTemplate = $("#cell-template");
        categories.each(
        function (i) {
            var category = i + 1;
            var clue = index + 1;
            var cell = cellTemplate.clone();
            var container = cell.children().addBack().filter(".container");
            var link = cell.children().addBack().first("a.jeopardy-cell")
            container.append(clue * 100)
            link.click(OnClickClue(cell, category, clue))
            $(value).append(cell);
        });
    });
}

function PopulateCluePopup(popup, category, clue)
{
    var clueContainer = popup.find(".clue");
    clueContainer.empty();
    clueContainer.append($("#category" + category + "-clue" + clue).clone());

    var categoryContainer = popup.find("h1");
    categoryContainer.empty();
    categoryContainer.append($("#category" + category + "-name").clone());

    var answerContainer = popup.find(".answer");
    answerContainer.empty();
    answerContainer.append($("#category" + category + "-answer" + clue).clone());

    clueContainer.css("display", "block");
    answerContainer.css("display", "none");

    popup.find(".show-answer").click(function () {
        DisplayAnswer(popup);
    });
}

var currentClueNode;
var currentCluePopup;

function OnClickClue(node, category, clue)
{
    return function () {
        currentClueNode = node;
        var index = ((category - 1) * numberCategories) + (clue - 1);
        if (index == dailyDoubleClue || true) {
            DisplayDailyDouble(category, clue);
        }
        else {
            DisplayClue(category, clue, clue * 100);
        }
    }
}

function DisplayDailyDouble(category, clue)
{
    var popup = CreatePopup("daily-double-popup");
    var clickButtonFunction = function () {
        var val = parseInt(popup.find("textarea")[0].value);
        if (val || val == 0) {
            DestroyPopup(popup);
            DisplayClue(category, clue, val);
        }
        else {
            alert("The given wager is invalid");
        }
    };
    
    popup.find(".button").click(clickButtonFunction);
    popup.find("textarea").focus();
    popup.find("textarea").keydown(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            clickButtonFunction();
            $(this)[0].value = "";
        }
    });
}

var clueValues = [];
var currentClueValue = 0;
function SetAllClueValues(value)
{
    currentClueValue = value;
    for (var key in clueValues)
    {
        clueValues[key] = value;
    }
}

function DisplayClue(category, clue, value)
{
    var popup = CreatePopup("clue-popup", function() { SetAllClueValues(0); });
    currentCluePopup = popup;
    SetAllClueValues(value);
    PopulateCluePopup(popup, category, clue);
}

function OnClickShowAnswer()
{
    DisplayAnswer(true);
}

var overlay;
var clueBox;
var addTeamBox;

var dailyDoubleClue;

function PickDailyDouble()
{
    var clues = $(".clue-cell");
    var index = Math.floor(Math.random() * clues.length + 1);
    dailyDoubleClue = index;
}

function GenerateRandomColor()
{
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);

    return "rgba(" + r + "," + g + "," + b + ", 1)";
}

function GenerateTeamColor()
{
    var colors = $("#preset-colors span");
    var scoreBoxCount = $("#score-box ul li.team-score").length;

    if (colors.length >= scoreBoxCount + 1)
    {
        return $(colors.get(scoreBoxCount)).html();
    }
    else
    {
        return GenerateRandomColor();
    }
}

function AddTeamRandomColor(name, startingScore)
{
    AddTeam(name, startingScore, GenerateTeamColor());
}

function AddTeam(name, startingScore, color)
{
    name = name.trim();
    if (!name || name.length == 0) return;


    var teamNode = $("#team-score-template").clone();
    teamNode.attr("id", "");
    var teamContainer = $("#score-box .team-list");
    var index = teamContainer.children(".team-score").length;
    var teamName = teamNode.find(".team-name");
    teamName.empty();
    teamName.append(name);

    var teamScore = teamNode.find(".team-points");
    SetScore(teamScore, startingScore);

    $("#add-team-button").before(teamNode);
    teamNode.css("background", color);
    teamNode.find(".plus-button").click(GetIncrementScoreFunction(teamNode, true, 1));
    teamNode.find(".minus-button").click(GetIncrementScoreFunction(teamNode, false, -1));

    teamNode.append("<div style='display: none;' class='team-index'>" + index + "</div>");
    teamNode.find(".team-points").click(
    function () {
        var score = teamNode.find(".team-points");
        var value = parseInt(score.text());
        var promptVal = prompt("Adjust score", value);
        if (promptVal != null && promptVal != "") {
            SetScore(teamScore, parseInt(promptVal));
        }
    });

    clueValues[index] = currentClueValue;
}

function GenerateAddTeamFromBoxFunction(box)
{
    return function () {
        AddTeamFromBox(box);
    }
}

function AddTeamFromBox(box)
{
    var teamName = box.find("textarea")[0].value;
    AddTeamRandomColor(teamName, 0);
}

function SetScore(scoreNode, value)
{
    scoreNode.empty();
    scoreNode.append(value);
}

function GetIncrementScoreFunction(teamNode, showAnswer, multiplier)
{
    return function () {
        var score = teamNode.find(".team-points").text();
        SetScore(teamNode.find(".team-points"), parseInt(score) + clueValues[parseInt(teamNode.find(".team-index").text())] * multiplier);
        if (showAnswer) DisplayAnswer(true);
    }
}

var popups = [];
function GetPopups()
{
    $("#popups").children().each(function (i, val) {
        var id = $(val).attr("id");
        popups[id] = val;
    });
}

function GetPopupDestroyFunction(popup, onDestroyCallback)
{
    return function () {
        DestroyPopup(popup);
        $("#score-box .filler").off("click");
        if (onDestroyCallback != null)
            onDestroyCallback();
    };
}

function CreatePopup(key, onDestroyCallback)
{
    if (!(key in popups)) return;
    var popup = $(popups[key]).clone();
    popup.attr("id", "");
    var c = popup.attr("class");
    c = (c ? c + " popup-box " : "popup-box ");
    popup.attr("class", c + key);
    popup.wrap("<div class='popup " + key + "-container'></div>");
    popup = popup.parent();
    popup.prepend("<div class='overlay'></div>");
    $("body").append(popup);
    var closePopup = GetPopupDestroyFunction(popup, onDestroyCallback);
    popup.find(".overlay").click(closePopup);
    $("#score-box .filler").click(closePopup)
    
    return popup;
}

function DestroyPopup(node)
{
    node.remove();
}

$(document).ready(function () {

    GetPopups();
    PopulateTable();
    PickDailyDouble();

    $("#add-team-button").click(
    function () {
        var popup = CreatePopup("add-team-popup");
        popup.find("button").click(GenerateAddTeamFromBoxFunction(popup));
        popup.find("textarea")[0].focus();
        popup.find("textarea").keydown(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                AddTeamFromBox(popup);
                $(this)[0].value = "";
            }
        });
    });

    var finalJeopardyButton = $("#final-jeopardy-button");
    var finalJeopardyButtonClick = function () {
        var destroyCallback = function () {
            finalJeopardyButton.off("click");
            finalJeopardyButton.click(finalJeopardyButtonClick);
        };
        var popup = CreatePopup("final-jeopardy-popup", destroyCallback);
        finalJeopardyButton.off("click");
        finalJeopardyButton.click(GetPopupDestroyFunction(popup, destroyCallback));
        var ul = popup.find(".wager-list");
        var template = $("#team-wager-template");
        $("#score-box li.team-score").each(function (i, val) {
            var li = template.clone();
            li.find(".team-name").append(($(val).find(".team-name").text()));
            li.find(".team-points").append(($(val).find(".team-points").text()));
            ul.append(li);
        });
    };
    finalJeopardyButton.click(finalJeopardyButtonClick);

    AddTeamRandomColor("Row row fight the power", 10000);
    //AddTeamRandomColor("Hey", 10000);
    //AddTeamRandomColor("Hey", 10000);
    //AddTeamRandomColor("Hey", 10000);
    //AddTeamRandomColor("Hey", 10000);
    //AddTeamRandomColor("Hey", 10000);
});