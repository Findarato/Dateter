/**
 * Requires datejs
 * @author Joseph Harry, a.k.a., Mr. Roboto Findarato
 * @version 1.0
 * @copyright August 5, 2009 
 */
(function(jQuery){
	jQuery.dateter={
		settings : {
			backgroundClass:"calendar-background",
			borderStyle:"solid",
			borderWidth:"1px",
			borderClass:"calendar-border",
			borderColor:"",
			borderRoundClass:"calendar-corner",
			
			calHolder:"",
			callbackFn:"",
			cellHeight:0,
			cellWidth:0,
			
			daysInMonth:31,
			dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
			daysToHighlight:{},
			displayHeader:true,
			
			fontColor:"calendar-fontColor",
			
			headerSelectors:{title:-1,back:-1,next:-1},
			height:"500px",
			highLightColors:["#3EC1FF", "#008FB2", "#FF8B00", "#B22D10", "#FF2000"],
			highLightToday:false,
			highLightTodayClass:"calendar-cell-today",
			
			initalFetchMonths:3,
			
			largeDisplay:false,
			leapYear:false,
			
			month:-1,
			monthsMoved:0,
			monthStartOn:0,
			monthSwitchFn:"", 
			
			name:"",
			noClick:false,

			pastDayShades:true,
			position:[], 
			
			showDaynames:false,
			shadeClass:"calendar-shade",
			smallDayNames:["S","M","T","W","T","F","S"],
			startMonth:-1,
			startofMonth:0,
			startYear:-1,
			
			timeSelector:false,
			
			uniqueName:"dateter",
			width:"500px", 
			year:-1
		}
	};
	var hideme=true;
	//var monthSwitch;
	var Settings = jQuery.dateter.settings;
	/**
	 * Main part of the script.  Pass it a series of options and a custom call back.
	 * @param {Object} options
	 * @param {Object} custom_callback
	 */
	jQuery.fn.hideBox=function(targetBox,speed,that){
		if(typeof speed != "number"){speed=300;}
		if(hideme){	$("#"+targetBox).fadeOut(speed);jQuery('#button-date-selector').css('z-index',6);}else{hideme=true;$('#'+that).focus();}
	}
 	jQuery.fn.dateter = function(options,custom_callback,custom_monthSwitch){
		target = jQuery(this);
		Settings = jQuery.extend({},jQuery.dateter.settings, options);
		Settings.callbackFn = custom_callback ? custom_callback : false;
		Settings.monthSwitchFn = custom_monthSwitch ? custom_monthSwitch : false;
		if (Settings.timeSelector) {
			Settings.cellHeight=Math.floor((parseInt(Settings.height)-40)/7);
			Settings.cellWidth=Math.floor((parseInt(Settings.width)-40)/7);
		}else{
			Settings.cellHeight=Math.floor((parseInt(Settings.height)-20)/7);
			Settings.cellWidth=Math.floor((parseInt(Settings.width)-20)/7);
		}
		target.data("Settings",Settings);
		jQuery.fn.dateter.init(target);
	}
	jQuery.fn.keyInArray = function (key,looparray){for(v_key in looparray){if(key == looparray[v_key]){return v_key;}}}
	/**
	 * Initialization function.  This is where all of the stuff happens.
	 * @param {Object} target
	 */
	jQuery.fn.dateter.init = function(target){
		if (target.data("Settings").year == -1) {
			target.data("Settings").year = Date.today().toString("yyyy");
		}
		if (target.data("Settings").month == -1) {
			target.data("Settings").month = Date.today().toString("M");
		}
		target.data("Settings").startofMonth = jQuery.fn.keyInArray(Date.today().set({ day: 1}).toString("dddd"),target.data("Settings").dayNames);
		target.data("Settings").daysInMonth = Date.getDaysInMonth(target.data("Settings").year,target.data("Settings").month-1);
		target.data("Settings").leapYear = Date.isLeapYear (target.data("Settings").year );
		target.data("Settings").name = target.data("Settings").uniqueName;
		target.data("Settings").monthName = Date.today().set({month: parseInt(target.data("Settings").month)-1}).toString("MMMM");
		target.data("Settings").position = target.position();
		
		if(target.data("Settings").noClick===true){ //used for when you need the selector to always be on the screen
			if(target.data("Settings").largeDisplay===true){
				settingsHold = target.data("Settings"); 
				settingsHold.cellWidth="14.2%";
				settingsHold.cellHeight="16.6%";
				settingsHold.width="100%";
				target.data("Settings",settingsHold);
				if (target.data("Settings").headerSelectors.title != -1) {
					target.empty().html(jQuery('<table/>'));
					if (target.data("Settings").headerSelectors.next != -1) {
						jQuery.fn.dateter.moveMonth(
							target.data("Settings").headerSelectors.next, 
							target.data("Settings"), 
							target, 1
						);
					}
					if (target.data("Settings").headerSelectors.back != -1) {
						jQuery.fn.dateter.moveMonth(
							target.data("Settings").headerSelectors.back, 
							target.data("Settings"), 
							target, -1
						);
					}
				}
			}
			jQuery.fn.dateter.drawCalendar(target,target.data("Settings"));
		}else{//a click calendar
			
			jQuery('#'+target.data("Settings").uniqueName).replaceWith();//remove any calBoxes that are around
			jQuery(target)
				.click(function(){
					Shadow = $("<div style=\" z-index:1000;\" id=\"Shadow\"/>")
						.click(function(){
							jQuery(".dateterPopup").fadeOut(200);
							$("#Shadow").remove();
							target.show()
						})
						.css({display:"block",top:0,left:0,height:jQuery('body').height(),width:jQuery('body').width(),position:"absolute"})
						.hide();
			jQuery('body').append(Shadow);
			jQuery(".dateterPopup").hide();
			jQuery("#"+target.data("Settings").uniqueName).css("z-index","1001").show();
			target.hide()
			jQuery("#Shadow").show();
			});
			//Add a shadow box
			jQuery(target)
				.parent()
				.append(
					calGlobal = jQuery('<div/>')
					.addClass(target.data("Settings").backgroundClass+" dateterPopup")
					.attr({id:target.data("Settings").uniqueName})
					.css({position:"absolute",top:jQuery(target).position.top,left:jQuery(target).position.left,padding:"3px"})
					.hide()
			);
			calGlobal.append(calBox = jQuery('<div/>'));
			if(target.data("Settings").timeSelector){
				calGlobal.append(
					jQuery("<div/>")
						.addClass(borderRoundClass)
						.css({position:"relative",bottom:0,left:0,width:"100%",height:"20px",paddingTop:"4px"})
						.append(jQuery("<span/>").addClass("opposite").html("Please Enter a time : "))
						.append(jQuery("<input/>").attr({type:"text",maxlength:"2"}).css({width:"20px"}).val("12").addClass("dropdown Ticketform"))
						.append(jQuery("<input/>").attr({type:"text",maxlength:"2"}).css({width:"20px"}).val("00").addClass("dropdown Ticketform"))
						.append(jQuery("<input/>").attr({type:"text",maxlength:"2"}).css({width:"20px"}).val("PM").addClass("dropdown Ticketform"))
				);
			}
			jQuery.fn.dateter.drawCalendar(calBox,target.data("Settings"),target);
			heightAdjust = jQuery(target).height();
			heightAdjust=0;
		}
	}
	jQuery.fn.dateter.moveMonth = function(selector,moveSettings,target,direction,drawTarget){
		target.data("Settings",jQuery.extend(true,target.data("Settings"), moveSettings));
		localsettings = target.data("Settings");
		selector
			.click(function(){
				hideme = false; 
				//$(this).blur();
				target.data("Settings").monthsMoved = parseInt(target.data("Settings").monthsMoved + direction);
				if (target.data("Settings").startYear == -1) {
					var NewMonth = Date.today().add(target.data("Settings").monthsMoved).months().toString("M");
					var NewYear = Date.today().add(target.data("Settings").monthsMoved).months().toString("yyyy");
					var NewMonthStart = jQuery.fn.keyInArray(Date.parse(parseInt(NewMonth) + "/1/" + NewYear).toString("dddd"), target.data("Settings").dayNames);
					//used to fetch the next month
					var NewYear2 = Date.today().add(target.data("Settings").monthsMoved+direction).months().toString("yyyy");
					var NewMonth2 = Date.today().add(target.data("Settings").monthsMoved+direction).months().toString("M");

				} else {
					var NewMonth = Date.parse(target.data("Settings").startYear + "/1/" + target.data("Settings").year).add(target.data("Settings").monthsMoved).months().toString("M");
					var NewYear = Date.parse(target.data("Settings").startMonth + "/1/" + target.data("Settings").year).add(target.data("Settings").monthsMoved).months().toString("yyyy");
					var NewMonthStart = jQuery.fn.keyInArray(Date.parse(parseInt(NewMonth) + "/1/" + NewYear).toString("dddd"), target.data("Settings").dayNames);
				}
				jQuery.fn.dateter.drawCalendar(target, {
					height:target.data("Settings").height,
					monthName:Date.today().set({month: parseInt(NewMonth) - 1}).toString("MMMM") + " " + NewYear,
					year: NewYear,
					monthsMoved: target.data("Settings").monthsMoved,
					month: NewMonth,
					startofMonth: NewMonthStart,
					daysToHighlight:target.data("Settings").daysToHighlight,
					daysInMonth: Date.getDaysInMonth(NewYear, NewMonth - 1)
				},drawTarget);
			});
	}
	jQuery.fn.dateter.drawHighlight = function(localSettings){
			try {dayTest = localSettings.daysToHighlight[parseInt(localSettings.year)][parseInt(localSettings.month)];}
			catch(e){dayTest = false;}
			if (dayTest) {
				lsdth = localSettings.daysToHighlight[parseInt(localSettings.year)][parseInt(localSettings.month)];
				jQuery.each(lsdth,function(i,item){
					eventBox = $("#eventBox"+i);//assign the selector once
					if (localSettings.largeDisplay === true) {
						eventBox.empty();
						ca2 = eventBox.height() - 20;
						if(ca2<0){ca2=15}
						//displayAmount = Math.round(parseInt(ca2) / 20);
						displayAmount = 100;
						var displayCnt = 0;
						var totalDisplay = 0;
						$.each(item, function(i2, item2){
							displayCnt++;
							/*
							if(console.log){
								console.log("boxHeight=>"+ca2+":Display amount=>"+displayAmount+":i2=>"+i2);	
							}
							*/
							
							if (i2 > displayAmount-1) {totalDisplay++;return;	}
							eventBox
								.append(
									$("<div/>")
										.addClass(localSettings.borderClass+" ui-corner-all")
										.css("float","left")
										.css({backgroundColor:"#FFF",position:"relative",textAlign: "left",height: "15px",overflow: "hidden",padding: "2px",margin: "2px",width: "15px",backgroundColor: localSettings.highLightColors[item2.location_id-1]})
										.click(function(){
											
											if(item2.name){
												title = item2.name;
												note = item2.comment;
											}else{
												title = "Reserved";
												note = "This room is reserved";
											}
											$("#eventPopBox").replaceWith();
											round = localSettings.borderRoundClass;
											position = $(this).position();
											eventBox
												.append(
													$("<div/>")
													.addClass(localSettings.borderClass+" "+localSettings.backgroundClass+" "+round)
													.css({
														textAlign:"left",
														padding: "2px",
														minWidth:$(this).parent().innerWidth()-5,
														minHeight:$(this).parent().innerHeight()-5,
														//maxWidth:$(this).parent().innerWidth()+20,
														height:"auto",
														position: "absolute",
														top: position.top+2,
														left: position.left+2,
														zIndex:"100"
													})
													.attr({id: "eventPopBox"})
													.html(
														$("<div/>")
															.addClass(localSettings.borderClass+" "+localSettings.shadeClass+" "+round)
															.css({width:"100%",height:"17px",position:"relative",fontSize:"12px"})
															.html(title)
															.append(
																$("<div/>")
																	.css({position: "absolute",	top: 0,right: 0})
																	.html(
																		$("<div/>")
																			.css({height:"10px",width:"10px"})
																			.html("&nbsp;")
																			.addClass(localSettings.borderClass+" "+localSettings.shadeClass+" "+round)
																	)
																	.click(function(){
																		$("#eventPopBox").replaceWith();//remove the box
																	})
															)
													)
													.append(
														$("<div/>")
															.html(note)
													)
													.append(
														$("<div/>")
															.html(
																$("<font/>")
																	.css({fontWeight:"bold"})
																	.addClass(localSettings.fontColor)
																	.html(item2.location_name)
															)
													)
													.append(
														$("<div/>")
															.css({position: "relative",	bottom: 0,left: 0})
															.html(
																$("<font/>")
																	.css({fontWeight:"bold"})
																	.addClass(localSettings.fontColor)
																	.html(item2.timeS + " - " + item2.timeE)
															)
													)
												);

										})
										.html(
											$("<span/>")
												.css({fontSize: "9px",fontWeight: "bold"})
												.html("&nbsp;"
												/*
													$("<font/>")
														.addClass(localSettings.fontColor)
														.html(item2.timeS + " - " + item2.timeE)
														*/
												)
										)
								);
						});
					
						//show the +x more and allow the person to see them
						if (displayCnt > displayAmount) {
							if(localSettings.borderRound){round = localSettings.borderRoundClass;}else{round = "";}
							//$("#dayBox"+i)
							eventBox
								.append(
									$("<a/>")
										.click(function(){
											position = $(this).parent().position();
											$("#eventBox"+i)
												.append(
													$("<div/>")
													.addClass(localSettings.borderClass+" "+localSettings.backgroundClass+" "+round)
													.css({
														textAlign:"left",
														padding: "2px",
														minWidth:$(this).parent().innerWidth()-5,
														minHeight:$(this).parent().innerHeight()-5,
														maxWidth:$(this).parent().innerWidth()+20,
														height:"auto",
														position: "absolute",
														top: position.top+2,
														left: position.left+2,
													})
													.attr({id: "eventPopBox"})
													.html(
														""
													)
													.append(
														$("<div/>")
															.css({position: "absolute",	top: 0,right: 0})
															.html(
																$("<div/>")
																	.css({height:"10px",width:"10px"})
																	.html("&nbsp;")
																	.addClass(localSettings.borderClass+" "+localSettings.shadeClass+" "+round)
															)
															.click(function(){
																$("#eventPopBox").replaceWith();//remove the box
															})
													)
													
												);
											return false;//do not do the href
										})
										.css({fontSize: "9px",fontWeight: "bold"})
										.html("&#43;" + (displayCnt - displayAmount) + " More"));
						}
					}else {
						smallDay = parseInt(i)+1;
						jQuery("#" + localSettings.uniqueName + "d" + smallDay)
							.css({backgroundColor: localSettings.highLightColors[0]});
					}
				});
					
			}
	}
	/**
	 * This area allows the calendar to be redrawn each time some one clicks back and forward on the calendar buttons
	 * @param {Object} calHolder
	 * @param {Object} displaySettings
	 */
	jQuery.fn.dateter.drawCalendar = function(calHolder, settings, target){
			localSettings = jQuery.extend(true,calHolder.data("Settings"), settings);
			calHolder.data("Settings", localSettings);
			var calTable = "";
			if (localSettings.displayHeader) {
				calHolder
					.empty()
					.html(
						jQuery('<table cellpadding="0" cellspacing="0" style="height:20px;width:' + localSettings.width + ';"/>')
							.append(
								jQuery('<tr/>')
									.append(
										jQuery('<td id="' + localSettings.uniqueName + 'calBackMonth" style="text-align:center; width:20px;"/>')
											.css({cursor: "pointer"})
											.html(
												$("<font/>")
													.addClass(localSettings.fontColor)
													.html("&laquo;")
											)
									)
									.append(
										jQuery('<td id="'+localSettings.uniqueName +'caltitle" style="width:auto;text-align:center"/>')
											.css("font-size", "14px")
											.html(
												$("<font/>")
													.addClass(localSettings.fontColor)
													.html(
														Date
															.today()
															.set({month: parseInt(localSettings.month) - 1})
															.toString("MMMM") + " " + localSettings.year)
											)
									)
									.append(
										jQuery('<td id="' + localSettings.uniqueName + 'calNextMonth" style="text-align:center; width:20px;"/>')
											.css({cursor: "pointer"})
											.html(
												$("<font/>")
													.addClass(localSettings.fontColor)
													.html("&raquo;")
											)
									)
							)
					);
			
				//add the clicks to the headers
				jQuery.fn.dateter.moveMonth($("#" + localSettings.uniqueName + "calBackMonth"), localSettings, calHolder, -1,target);
				jQuery.fn.dateter.moveMonth($("#" + localSettings.uniqueName + "calNextMonth"), localSettings, calHolder, 1,target);
				
			} else {
				calHolder.empty().html(jQuery('<table/>'));
				if (localSettings.headerSelectors.title != -1) {
					localSettings.headerSelectors.title
						.html(
							Date
								.today()
								.set({month: parseInt(localSettings.month) -1})
								.toString("MMMM") + " " + localSettings.year
					);
				}
			}
			var cnt = 0;
			var dayCnt = 0;
			var monthStart = false;
			calHolder
				.append(
					calTable = jQuery('<table cellpadding="0" cellspacing="0"/>')
						.css({width: localSettings.width,height: localSettings.height})
						.attr({id: "calBox" + localSettings.uniqueName})
				);
			realCellHeight = $("#calBox" + localSettings.uniqueName).height() / 6;
			realCellHeight--; //hopefuly fix the 6 row scroll bar
			calTable.empty();
			for (var a = 0; a < 6; a++) {//Y
				calTable.append(jQuery('<tr id="' + localSettings.uniqueName + 'w' + a + '"/>'));
				for (var b = 0; b < 7; b++) {//X
					jQuery("#" + localSettings.uniqueName + "w" + a).append(jQuery('<td id="' + localSettings.uniqueName + 'd' + cnt + '"/>"')
					.addClass(localSettings.borderClass)
					.css({
						fontSize: "11px",
						textAlign: "center",
						width: localSettings.cellWidth,
						height: localSettings.cellHeight
					}));
					var a_Pass = new Array();
					a_Pass[0] = localSettings.year == parseInt(Date.today().toString("yyyy"));
					a_Pass[1] = localSettings.year < parseInt(Date.today().toString("yyyy"));
					a_Pass[2] = a_Pass[0] && localSettings.month < parseInt(Date.today().toString("M"));
					a_Pass[3] = a_Pass[0] && localSettings.month == Date.today().toString("M") && dayCnt < parseInt(Date.today().toString("d"));
					
					if (cnt >= localSettings.startofMonth && dayCnt < localSettings.daysInMonth) {
						curDay = jQuery("#" + localSettings.uniqueName + "d" + cnt)
						dayCnt++;
						dayBG = localSettings.shadeClass;
						if (localSettings.largeDisplay === true) {
							curDay
								.html(
									$("<div/>")
										.attr({id:"dayBox"+dayCnt})
										.css({overflow: "hidden",height: "100%",width: "100%"})
										.html(
											clickArea = $("<div/>")
												.css({width: "100%",height: "15px"})
												.addClass(localSettings.borderClass+" "+dayBG)
												.html(
													$("<font/>")
														.addClass(localSettings.fontColor)
														.html(dayCnt)
												)
										)
										.append(
											clickArea2 = $("<div/>")
												.attr({id:"eventBox"+dayCnt})
												.css({overFlow: "hidden",width: "100%",height: realCellHeight - 15})
												.addClass("clickarea2 "+localSettings.borderClass)
										)
								);
						}else {
							clickArea = curDay
								.html(
									$("<font/>")
										.addClass(localSettings.fontColor)
										.html(dayCnt)
								);
						}
						if (localSettings.pastDayShades) {
							curDay.addClass(((a_Pass[1] || a_Pass[2] || a_Pass[3]) ? "color-off" : "calendar-cell")).css({
								cursor: "pointer"
							});
						}else {
							if(localSettings.highLightToday){
								if(Date.today().toString("d") == dayCnt && Date.today().toString("M")== localsettings.month ){
									curDay.addClass(localSettings.highLightTodayClass).css({cursor: "pointer"});
								}else{
									curDay.addClass("calendar-cell").css({cursor: "pointer"});
								}
							}else{
								curDay.addClass("calendar-cell").css({cursor: "pointer"});
							}
						}
						clickArea
							.click(function(){
								if (calHolder.data("Settings").callbackFn) {
									$("#Shadow").remove();
									calHolder.data("Settings").callbackFn(calHolder.data("Settings").month, $(this).text(), calHolder.data("Settings").year);
									if (calHolder.data("Settings").noClick === false) {
									//	alert(calHolder.html());
										target.show()
										calHolder.parent().fadeOut(300);
									}
								}
						});
					}
					cnt++;
				}
			}
			jQuery.fn.dateter.drawHighlight(calHolder.data("Settings"));
			if (calHolder.data("Settings").monthSwitchFn) {
				for(v=0;v<calHolder.data("Settings").initalFetchMonths;v++){
					var NewYear3 = Date.today().add(calHolder.data("Settings").monthsMoved-v).months().toString("yyyy");
					var NewMonth3 = Date.today().add(calHolder.data("Settings").monthsMoved-v).months().toString("M");
					var NewYear2 = Date.today().add(calHolder.data("Settings").monthsMoved+v).months().toString("yyyy");
					var NewMonth2 = Date.today().add(calHolder.data("Settings").monthsMoved+v).months().toString("M");
					calHolder.data("Settings").monthSwitchFn(NewMonth2,-1,NewYear2);
					calHolder.data("Settings").monthSwitchFn(NewMonth3,-1,NewYear3);	
				}
			}
		};
 })(jQuery);