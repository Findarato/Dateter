/**
 * Requires datejs
 * @author Joseph Harry, a.k.a., Mr. Roboto Findarato StartedAugust 5, 2009
 * @version 1.5.0
 * 
 * 
 * The days to highlight object requires a json object in the following order
 * {"2010":
 * 		{"1":
 * 			{"14":
 * 				[
 * 					{"location_name":"Small Meeting room","comment":"","name":"Lassie Come-Home Readers Group",id:"34","location_id":"1","timeS":"14:00","timeE":"15:00"}
 * 				]
 * 			}
 * 		}
 * }
 */
(function (jQuery) {
	/**
	 * Global variables for dateter.  Most of these can be over written though the options paramater
	 */
	var ts = new Date().getTime();
	var settings = {
		"backgroundClass": "calendar-background",
		"borderStyle": "solid",
		"borderWidth": "1px",
		"borderClass": "calendar-border",
		"borderColor": "",
		"borderRoundClass": "calendar-corner",

		"calHolder": "",
		"callbackFn": "",
		"cellHeight": 0,
		"cellWidth": 0,
		"calendarCell": "calendar-cell",

		"daysInMonth": 31,
		"dayNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		"daysToHighlight": {},
		"displayHeader": true,

		"fontColor": "calendar-fontColor",

		"headerSelectors": {
			"title": -1,
			"back": -1,
			"next": -1
		},
		"height": "500px",
		"highLightColors": ["#3EC1FF", "#008FB2", "#FF8B00", "#B22D10", "#FF2000"],
		"highLightSize": "14px",
		"highLightToday": false,
		"highLightTodayClass": "calendar-cell-today",

		"initialFetchMonths": 0,

		"largeDisplay": false,
		"leapYear": false,

		"month": -1,
		"monthsMoved": 0,
		"monthStartOn": 0,
		"monthSwitchFn": "",

		"name": "",
		"noClick": false,

		"offsetX": "0",
		"offsetY": "0",

		"pastDayShades": true,
		"pastDayShadeClass": "calendar-pastShade",
		"position": [],
		"popUpBackgroundClass": "calendar-cell",
		"popUpBox": "<div style='background-Color:replace-color'>replace-title replace-startTime replace-startTime replace-note replace-location<div id='popUpCloseButton' style='height:10px;width:10px;background-Color:#000;border:1px #00000 solid;'></div></div>",

		"showDaynames": false,
		"shadeClass": "calendar-shade",
		"smallDayNames": ["S", "M", "T", "W", "T", "F", "S"],
		"startMonth": -1,
		"startofMonth": 0,
		"startYear": -1,

		"timeSelector": false,

		"uniqueName": "dateter" + ts,
		"width": "500px",
		"year": -1
	};
	var hideme = true;
	var Target = "";
	/**
	 * Main part of the script.  Pass it a series of options and a custom call back.
	 * @param {Object} options
	 * @param {Object} custom_callback
	 */
	jQuery.fn.dateter = function (options, custom_callback, custom_monthSwitch) {
		target = jQuery(this);
		Target = jQuery(this);
		Settings = jQuery.extend({}, settings, options);
		Settings.callbackFn = custom_callback ? custom_callback : false;
		Settings.monthSwitchFn = custom_monthSwitch ? custom_monthSwitch : false;
		if (Settings.timeSelector) {
			Settings.cellHeight = Math.floor((parseInt(Settings.height) - 40) / 7);
			Settings.cellWidth = Math.floor((parseInt(Settings.width) - 40) / 7);
		} else {
			Settings.cellHeight = Math.floor((parseInt(Settings.height) - 20) / 7);
			Settings.cellWidth = Math.floor((parseInt(Settings.width) - 20) / 7);
		}
		target.data("Settings", Settings);
		jQuery.fn.dateter.init(target);
	}
	jQuery.fn.keyInArray = function (key, looparray) {
		for (v_key in looparray) {
			if (key == looparray[v_key]) {
				return v_key;
			}
		}
	}
	/**
	 * Initialization function.  This is where all of the stuff happens.
	 * @param {Object} target
	 */
	jQuery.fn.dateter.init = function (target) {
		if (target.data("Settings").year == -1) {
			target.data("Settings").year = Date.today().toString("yyyy");
		}
		if (target.data("Settings").month == -1) {
			target.data("Settings").month = Date.today().toString("M");
		}
		target.data("Settings").startofMonth = jQuery.fn.keyInArray(Date.today().set({
			day: 1
		}).toString("dddd"), target.data("Settings").dayNames);
		target.data("Settings").daysInMonth = Date.getDaysInMonth(target.data("Settings").year, target.data("Settings").month - 1);
		target.data("Settings").leapYear = Date.isLeapYear(target.data("Settings").year);
		target.data("Settings").name = target.data("Settings").uniqueName;
		target.data("Settings").monthName = Date.today().set({
			month: parseInt(target.data("Settings").month) - 1
		}).toString("MMMM");
		target.data("Settings").position = target.position();

		if (target.data("Settings").noClick === true) { //used for when you need the selector to always be on the screen
			if (target.data("Settings").largeDisplay === true) {
				settingsHold = target.data("Settings");
				settingsHold.cellWidth = "14.2%";
				settingsHold.cellHeight = "16.6%";
				settingsHold.width = "100%";
				target.data("Settings", settingsHold);
				if (target.data("Settings").headerSelectors.title != -1) {
					target.empty().html(jQuery("<table/>"));
					if (target.data("Settings").headerSelectors.next != -1) {
						jQuery.fn.dateter.moveMonth(
						target.data("Settings").headerSelectors.next, target.data("Settings"), target, 1);
					}
					if (target.data("Settings").headerSelectors.back != -1) {
						jQuery.fn.dateter.moveMonth(
						target.data("Settings").headerSelectors.back, target.data("Settings"), target, -1);
					}
				}
			}
			jQuery.fn.dateter.drawCalendar(target, target.data("Settings"));
		} else { //a click calendar
			jQuery("#" + target.data("Settings").uniqueName).replaceWith(); //remove any calBoxes that are around
			jQuery(target).click(function () {
				jQuery("#" + target.data("Settings").uniqueName).css({
					"position": "absolute",
					"top": parseInt(jQuery(this).offset().top + parseInt(target.data("Settings").offsetY)),
					"left": parseInt(jQuery(this).offset().left + parseInt(target.data("Settings").offsetX))
				});

				Shadow = jQuery("<div/>", {
					id: "Shadow",
					css: {
						"z-index": 999999,
						"display": "block",
						"top": 0,
						"left": 0,
						"height": jQuery("body").height(),
						"width": jQuery("body").width(),
						"position": "absolute"
					},
					click: function () {
						jQuery(".dateterPopup").fadeOut(200);
						jQuery("#Shadow").remove();
						target.show()
					}
				}).hide();
				jQuery("body").append(Shadow);
				jQuery(".dateterPopup").hide();
				jQuery("#" + target.data("Settings").uniqueName).css("z-index", 1000000).show();
				jQuery("#Shadow").show();

			});
			//Add a shadow box
			jQuery("body").append(
			calGlobal = jQuery("<div/>", {
				id: target.data("Settings").uniqueName,
				"class": target.data("Settings").borderClass + " " + target.data("Settings").borderRoundClass + " " + target.data("Settings").backgroundClass + " " + target.data("Settings").shadeClass + " " + "dateterPopup"
			}).hide());
			calGlobal.append(calBox = jQuery("<div/>"));
			jQuery.fn.dateter.drawCalendar(calBox, target.data("Settings"), target);
			heightAdjust = jQuery(target).height();
			heightAdjust = 0;
		}
	}
	/**
	 * Used to actually move the month of the calendar display
	 * @param {Object} selector
	 * @param {Object} moveSettings
	 * @param {Object} target
	 * @param {int} direction
	 * @param {Object} drawTarget
	 */
	jQuery.fn.dateter.moveMonth = function (selector, moveSettings, target, direction, drawTarget) {
		target.data("Settings", jQuery.extend(true, target.data("Settings"), moveSettings));
		localsettings = target.data("Settings");
		selector.click(function () {
			hideme = false;
			//jQuery(this).blur();
			target.data("Settings").monthsMoved = parseInt(target.data("Settings").monthsMoved + direction);
			if (target.data("Settings").startYear == -1) {
				var NewMonth = Date.today().add(target.data("Settings").monthsMoved).months().toString("M");
				var NewYear = Date.today().add(target.data("Settings").monthsMoved).months().toString("yyyy");
				var NewMonthStart = jQuery.fn.keyInArray(Date.parse(parseInt(NewMonth) + "/1/" + NewYear).toString("dddd"), target.data("Settings").dayNames);
				//used to fetch the next month
				var NewYear2 = Date.today().add(target.data("Settings").monthsMoved + direction).months().toString("yyyy");
				var NewMonth2 = Date.today().add(target.data("Settings").monthsMoved + direction).months().toString("M");

			} else {
				var NewMonth = Date.parse(target.data("Settings").startYear + "/1/" + target.data("Settings").year).add(target.data("Settings").monthsMoved).months().toString("M");
				var NewYear = Date.parse(target.data("Settings").startMonth + "/1/" + target.data("Settings").year).add(target.data("Settings").monthsMoved).months().toString("yyyy");
				var NewMonthStart = jQuery.fn.keyInArray(Date.parse(parseInt(NewMonth) + "/1/" + NewYear).toString("dddd"), target.data("Settings").dayNames);
			}
			jQuery.fn.dateter.drawCalendar(target, {
				"height": target.data("Settings").height,
				"monthName": Date.today().set({
					month: parseInt(NewMonth) - 1
				}).toString("MMMM") + " " + NewYear,
				"year": NewYear,
				"monthsMoved": target.data("Settings").monthsMoved,
				"month": NewMonth,
				"startofMonth": NewMonthStart,
				"daysToHighlight": target.data("Settings").daysToHighlight,
				"daysInMonth": Date.getDaysInMonth(NewYear, NewMonth - 1)
			}, drawTarget);
		});
	}
	jQuery.fn.dateter.createPopupbox = function (template, data) {
		var keys = {
			title: "replace-title",
			note: "replace-note",
			location: "replace-location",
			color: "replace-color",
			startTime: "replace-startTime",
			endTime: "replace-startTime"
		}
		var popUp = template;

		for (var v_Key in keys) {
			while (popUp.indexOf(keys[v_Key]) > -1) {
				popUp = popUp.replace(keys[v_Key], data[v_Key]);

			}
		}
		popUp = $(popUp).attr("id", "eventPopBox").addClass("eventPopBoxCSS");
		popUp.find("#popUpCloseButton").click(function () {
			jQuery(".eventPopBoxCSS").replaceWith("");
			jQuery("#eventPopBox").replaceWith("");
		});
		return popUp;
	}
	/**
	 * Draws the calendar highlights
	 * @param {Object} localSettings
	 */
	jQuery.fn.dateter.drawHighlight = function (localSettings) {
		jQuery(".dateterHighlight").replaceWith();
		dayTest = false;
		try {
			dayTest = localSettings.daysToHighlight[parseInt(localSettings.year)][parseInt(localSettings.month)];
		}
		catch(e) {
			dayTest = false;
		}
		if (dayTest) {
			lsdth = localSettings.daysToHighlight[parseInt(localSettings.year)][parseInt(localSettings.month)];
			jQuery.each(lsdth, function (i, item) {
				var dateClass = "date-" + parseInt(localSettings.year) + "-" + parseInt(localSettings.month) + "-" + i;
				eventBox = jQuery("#eventBox" + i); //assign the selector once
				if (localSettings.largeDisplay === true) {
					eventBox.empty();
					ca2 = eventBox.height() - 20;
					if (ca2 < 0) {
						ca2 = 15
					}
					displayAmount = 100;
					var displayCnt = 0;
					var totalDisplay = 0;
					jQuery.each(item, function (i2, item2) {
						displayCnt++;
						if (i2 > displayAmount - 1) {
							totalDisplay++;
							return;
						}
						eventBox.css({
							overflow: "hidden"
						}).append(
						jQuery("<div/>", {
							id: "cs-" + item2.id,
							name: item2.name,
							css: {
								"float": "left",
								"textAlign": "left",
								"height": localSettings.highLightSize,
								"overflow": "hidden",
								"padding": "2px",
								"margin": "2px",
								"width": localSettings.highLightSize,
								"backgroundColor": localSettings.highLightColors[item2.location_id]
							},
							"class": localSettings.borderClass + " " + localSettings.borderRoundClass + " " + "dateterHighlight" + " " + dateClass + " " + "location-" + item2.location_id,
							click: function () {
								jQuery(".eventPopBoxCSS").replaceWith("");
								position = jQuery(this).offset();
								jQuery("body").append(
								popBox = jQuery.fn.dateter.createPopupbox(localSettings.popUpBox, {
									"title": item2.name,
									"note": item2.comment,
									"location": item2.location_name,
									"color": localSettings.highLightColors[item2.location_id],
									"startTime": item2.timeS,
									"endTime": item2.timeE
								}))
								popBox.css({
									"position": "absolute",
									"top": position.top,
									"left": position.left,
									"zIndex": 500
								});
								eventBoxShift = jQuery("body").outerWidth() - (popBox.outerWidth() + position.left);
								if (eventBoxShift < 0) {
									eventBoxLeft = popBox.position().left;
									Adjustment = parseInt(eventBoxLeft) + parseInt(eventBoxShift) - 5;
									popBox.css({
										"left": Adjustment
									});
								}
							}

						}));
					});
				} else {
					smallDay = parseInt(i) + 1;
					jQuery("#" + localSettings.uniqueName + "d" + smallDay, {
						css: {
							"backgroundColor": localSettings.highLightColors[0]
						}
					});
				}
			});
		} else { //there is no data for this month
			setTimeout("jQuery.fn.dateter.drawHighlight(localSettings)", 300);
		}
	}
	/**
	 * A simple way to resize the calendar with out having to redraw it, and thus reget all the data.
	 * @param int newHeight the hight of the calendar
	 * @param {Object} target the jQuery selector of the calendar
	 */
	jQuery.fn.dateter.resize = function (newHeight, target) {
		$("#calBox" + target.data("Settings").uniqueName).css({
			"height": newHeight
		}).find(".clickarea2").css({
			"height": (newHeight / 6) - 15
		});
	}
	/**
	 * This area allows the calendar to be redrawn each time some one clicks back and forward on the calendar buttons
	 * @param {Object} calHolder
	 * @param {Object} displaySettings
	 */
	jQuery.fn.dateter.drawCalendar = function (calHolder, settings, target) {
		localSettings = jQuery.extend(true, calHolder.data("Settings"), settings);
		calHolder.data("Settings", localSettings);
		var calTable = "";
		if (localSettings.displayHeader) {
			calHolder.html(
			jQuery("<div/>", {
				css: {
					"box-sizing":"border-box",
					"-moz-box-sizing":"border-box",
					"-webkit-box-sizing":"border-box",
					"display":"table",
					"height": "20px",
					"width": "100%"
				}
			}).addClass(localSettings.shadeClass).html(
			jQuery("<div/>", {
				id: localSettings.uniqueName + "calBackMonth",
				css: {
					"box-sizing":"border-box",
					"-moz-box-sizing":"border-box",
					"-webkit-box-sizing":"border-box",
					"display":"table-cell",
					"text-align": "center",
					"width": "20px",
					"cursor": "pointer"
				},
				html: jQuery("<font/>", {
					html: "&laquo;"
				})
			})).append(
			jQuery('<div/>', {
				id: localSettings.uniqueName + "caltitle",
				css: {
					"box-sizing":"border-box",
					"-moz-box-sizing":"border-box",
					"-webkit-box-sizing":"border-box",
					"display":"table-cell",
					"width": "auto",
					"text-align": "center",
					"font-size": "14px"
				},
				html: jQuery("<font/>", {
					html: Date.today().set({
						month: parseInt(localSettings.month) - 1
					}).toString("MMMM") + " " + localSettings.year
				}).addClass(localSettings.fontColor)
			})).append(
			jQuery("<div/>", {
				id: localSettings.uniqueName + "calNextMonth",
				css: {
					"box-sizing":"border-box",
					"-moz-box-sizing":"border-box",
					"-webkit-box-sizing":"border-box",
					"display":"table-cell",
					"text-align": "center",
					"width": "20px",
					"cursor": "pointer"
				},
				html: jQuery("<font/>", {
					html: "&raquo;"
				}).addClass(localSettings.fontColor)
			})));
			jQuery.fn.dateter.moveMonth(jQuery("#" + localSettings.uniqueName + "calBackMonth"), localSettings, calHolder, -1, target);
			jQuery.fn.dateter.moveMonth(jQuery("#" + localSettings.uniqueName + "calNextMonth"), localSettings, calHolder, 1, target);
		} else {
			calHolder.html(
				$("<div/>",{
					css:{"display":"table","width":"100%"}
				})
			);
			if (localSettings.headerSelectors.title != -1) {
				localSettings.headerSelectors.title.html(
				Date.today().set({
					"month": parseInt(localSettings.month) - 1
				}).toString("MMMM") + " " + localSettings.year);
			}
		}
		var cnt = 0;
		var dayCnt = 0;
		var monthStart = false;
		var correctedHeight = 0;
		
		if (localSettings.displayHeader) {
			realCellHeight = parseInt(parseInt(localSettings.height) - 20) / 6;
			realCellHeight--; //hopefuly fix the 6 row scroll bar
			correctedHeight = localSettings.height - 20;
		} else {
			realCellHeight = parseInt(localSettings.height) / 6;
			realCellHeight--; //hopefuly fix the 6 row scroll bar
			correctedHeight = localSettings.height;
		}
		calHolder.append(
		calTable = jQuery("<div/>",{
			id: "calBox" + localSettings.uniqueName,
			css:{
				"display":"table",
				"width": localSettings.width,
				"height": correctedHeight
				}
			}
		)
			.addClass(localSettings.borderClass));
		calTable.empty();
		for (var a = 0; a < 6; a++) { //Y
			calTable.append(jQuery("<div/>", {
				id: localSettings.uniqueName + 'w' + a,
				css:{"display":"table-row"}
			}));
			for (var b = 0; b < 7; b++) { //X
				jQuery("#" + localSettings.uniqueName + "w" + a).append(
				jQuery("<div/>", {
					css: {
						"box-sizing":"border-box",
						"-moz-box-sizing":"border-box",
						"-webkit-box-sizing":"border-box",						
						"display":"table-cell",
						"fontSize": "11px",
						"textAlign": "center",
						"width": localSettings.cellWidth,
						"height": localSettings.cellHeight
					},
					"class": localSettings.borderClass,
					id: localSettings.uniqueName + 'd' + cnt
				}));
				var a_Pass = new Array();
				a_Pass[0] = localSettings.year == parseInt(Date.today().toString("yyyy"));
				a_Pass[1] = localSettings.year < parseInt(Date.today().toString("yyyy"));
				a_Pass[2] = a_Pass[0] && localSettings.month < parseInt(Date.today().toString("M"));
				a_Pass[3] = a_Pass[0] && localSettings.month == Date.today().toString("M") && dayCnt < parseInt(Date.today().toString("d"));

				if (cnt >= localSettings.startofMonth && dayCnt < localSettings.daysInMonth) {
					curDay = jQuery("#" + localSettings.uniqueName + "d" + cnt)
					dayCnt++;
					if (localSettings.largeDisplay === true) {
						curDay.html(
						jQuery("<div/>", {
							id: "dayBox" + dayCnt,
							css: {
								"overflow": "hidden",
								"height": "100%",
								"width": "100%"
							},
							html: clickArea = jQuery("<div/>", {
								css: {
									"borderTop": 0,
									"borderLeft": 0,
									"borderRight": 0,
									"width": "100%",
									"cursor": "pointer",
									"height": "15px"
								},
								"class": localSettings.borderClass + " " + localSettings.shadeClass + " " + localSettings.fontColor,
								html: dayCnt
							})
						}).append(clickArea2 = jQuery("<div/>", {
							id: "eventBox" + dayCnt,
							css: {
								"borderTop": 0,
								"borderLeft": 0,
								"borderRight": 0,
								"overFlow": "hidden",
								"cursor": "pointer",
								"width": "100%",
								"height": parseInt(realCellHeight - 15)
							},
							"class": "clickarea2"
						})));
					} else { //small calendar
						clickArea = curDay.css({
							"height": realCellHeight,
							"cursor": "pointer"
						}).addClass(localSettings.fontColor).html(dayCnt)

					}
					if (localSettings.pastDayShades) {
						curDay.addClass(((a_Pass[1] || a_Pass[2] || a_Pass[3]) ? localSettings.pastDayShadeClass : localSettings.calendarCell)).css({
							"cursor": "pointer"
						});
					}
					if (localSettings.highLightToday) {
						if (Date.today().toString("d") == dayCnt && Date.today().toString("M") == localsettings.month && Date.today().toString("yyyy") == localsettings.year) {
							curDay.addClass(localSettings.highLightTodayClass).removeClass(localSettings.pastDayShadeClass).css({
								"cursor": "pointer"
							});
						}
					}
					if (!localSettings.pastDayShades && !(Date.today().toString("d") == dayCnt && Date.today().toString("M") == localsettings.month && Date.today().toString("yyyy") == localsettings.year)) {
						curDay.addClass(localSettings.calendarCell); //fixed a bug with not having past days shade on					
					}
					clickArea.click(function () {
						if (calHolder.data("Settings").callbackFn) {
							jQuery("#Shadow").remove();
							calHolder.data("Settings").callbackFn(localSettings.month, jQuery(this).text(), localSettings.year);
							if (calHolder.data("Settings").noClick === false) {
								target.show();
								calHolder.parent().fadeOut(300);
							}
						}
					});
				} else { //fillin the data for empty cells
					curDay = jQuery("#" + localSettings.uniqueName + "d" + cnt)
					if (localSettings.largeDisplay === true) {
						curDay.html(jQuery("<div/>", {
							id: "dayBox" + dayCnt,
							css: {
								"overflow": "hidden",
								"height": "100%",
								"width": "100%"
							}
						}).html(
						clickArea = jQuery("<div/>", {
							html: jQuery("<font/>", {
								"class": localSettings.fontColor,
								html: "&nbsp;"
							}),
							css: {
								"borderTop": 0,
								"borderLeft": 0,
								"borderRight": 0,
								"width": "100%",
								"height": "16px"
							}
						})).append(
						clickArea2 = jQuery("<div/>", {
							id: "eventBox" + dayCnt,
							css: {
								"borderTop": 0,
								"borderLeft": 0,
								"borderRight": 0,
								"overFlow": "hidden",
								"width": "100%",
								"height": parseInt(realCellHeight - 15)
							},
							"class": "clickarea2"
						})));
					} else {
						curDay.html(jQuery("<div/>", {
							css: {
								"height": realCellHeight
							},
							html: "&nbsp;"
						}));
					}
				}
				cnt++;
			}
		}
		jQuery.fn.dateter.drawHighlight(localSettings);
		if (calHolder.data("Settings").monthSwitchFn) {
			if (calHolder.data("Settings").initialFetchMonths == 0) {
				calHolder.data("Settings").monthSwitchFn(localSettings.month, -1, localSettings.year);
			} else {
				for (v = 1; v < parseInt(calHolder.data("Settings").initialFetchMonths); v++) {
					var NewYear3 = Date.today().add(calHolder.data("Settings").monthsMoved - v).months().toString("yyyy");
					var NewMonth3 = Date.today().add(calHolder.data("Settings").monthsMoved - v).months().toString("M");

					var NewYear2 = Date.today().add(calHolder.data("Settings").monthsMoved + v).months().toString("yyyy");
					var NewMonth2 = Date.today().add(calHolder.data("Settings").monthsMoved + v).months().toString("M");

					calHolder.data("Settings").monthSwitchFn(NewMonth2, -1, NewYear2);
					calHolder.data("Settings").monthSwitchFn(NewMonth3, -1, NewYear3);
				}
			}
		}
	};
})(jQuery);