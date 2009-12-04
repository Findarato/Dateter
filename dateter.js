/**
 * Requires datejs
 * @author Joseph Harry, a.k.a., Mr. Roboto Findarato
 * @version 1.0
 * @copyright August 5, 2009 
 */
(function(jQuery){
	jQuery.dateter={
		settings : {
			borderStyle:"solid",
			borderWidth:"1px",
			
			calHolder:"",
			callbackFn:"",
			cellHeight:0,
			cellWidth:0,
			
			daysInMonth:31,
			dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
			daysToHighlight:{},
			displayHeader:true,
			
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
		
		if (Settings.noClick === true) {
		}else{target.attr("onBlur","javascript:setTimeout(\'jQuery.fn.hideBox(\"calBox\",300,\""+target.attr("id")+"\")\',200);");}
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
		}else{
			jQuery('#'+target.data("Settings").uniqueName).replaceWith();//remove any calBoxes that are around
			jQuery(target).click(function(){
				jQuery(".dateterPopup").hide();
				jQuery("#"+target.data("Settings").uniqueName).show();
				target.css('z-index',-20);hideme=true;});
			target.parent().append(
				calGlobal = jQuery('<div/>')
				.addClass("OL-fred color-off dateterPopup")
				.attr({id:target.data("Settings").uniqueName})
				.css({position:"absolute",
				top:target.data("Settings").position.top,
				left:target.data("Settings").position.left,padding:"3px"})
				.hide());
			calGlobal.append(calBox = jQuery('<div/>'));
			if(target.data("Settings").timeSelector){
				calGlobal.append(
					jQuery("<div/>")
						.css({position:"relative",bottom:0,left:0,width:"100%",height:"20px",paddingTop:"4px"})
						.append(jQuery("<span/>").addClass("opposite").html("Please Enter a time : "))
						.append(jQuery("<input/>").attr({type:"text",maxlength:"2"}).css({width:"20px"}).val("12").addClass("dropdown Ticketform"))
						.append(jQuery("<input/>").attr({type:"text",maxlength:"2"}).css({width:"20px"}).val("00").addClass("dropdown Ticketform"))
						.append(jQuery("<input/>").attr({type:"text",maxlength:"2"}).css({width:"20px"}).val("PM").addClass("dropdown Ticketform"))
						/*
						 * <input type="text" name="newReservationSdate" id="newReservationSdate" class="dropdown Ticketform" maxlength="50" style="width:8em" value="Pick a date" />
				<input type="text" name="newReservationShour" id="newReservationShour" class="dropdown Ticketform" maxlength="2" style="width:20px" value="12" />
				<font class="opposite">:</font>
				<input type="text" name="newReservationSminute" id="newReservationSminute" class="dropdown Ticketform" maxlength="2" style="width:20px" value="00" />
				<input type="text" name="newReservationSampm" id="newReservationSampm" class="dropdown Ticketform" maxlength="2" style="width:23px" value="PM" />
						 */
				);
			}
			jQuery.fn.dateter.drawCalendar(calBox,target.data("Settings"),target);
			//position = jQuery(target).position();
			heightAdjust = jQuery(target).height();
			heightAdjust=0;
			//calBox.css({top:position.top+heightAdjust,left:position.left,position:"absolute"});	
		}
	}
	jQuery.fn.dateter.moveMonth = function(selector,moveSettings,target,direction){
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
				});
			});
			
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
				calHolder.empty().html(jQuery('<table cellpadding="0" cellspacing="0" style="height:20px;width:' + localSettings.width + ';"/>').append(jQuery('<tr/>').append(jQuery('<td id="' + localSettings.uniqueName + 'calBackMonth" style="text-align:center; width:20px;"/>').css({
					cursor: "pointer"
				}).html("<img src='/lapcat/layout/icons/4-7-2.png' style='margin-bottom:3px;'/>")).append(jQuery('<td class="font white" id="'+localSettings.uniqueName +'caltitle" style="width:auto;text-align:center"/>').css("font-size", "14px").html(Date.today().set({
					month: parseInt(localSettings.month) - 1
				}).toString("MMMM") + " " + localSettings.year)).append(jQuery('<td id="' + localSettings.uniqueName + 'calNextMonth" style="text-align:center; width:20px;"/>').css({
					cursor: "pointer"
				}).html("<img src='/lapcat/layout/icons/4-7-1.png' style='margin-bottom:3px;'/>"))));
			
				//add the clicks to the headers
				jQuery.fn.dateter.moveMonth($("#" + localSettings.uniqueName + "calBackMonth"), localSettings, calHolder, -1);
				jQuery.fn.dateter.moveMonth($("#" + localSettings.uniqueName + "calNextMonth"), localSettings, calHolder, 1);
				
			} else {
				calHolder.empty().html(jQuery('<table/>'));
				if (localSettings.headerSelectors.title != -1) {
					localSettings.headerSelectors.title.html(
						Date.today().set({
							month: parseInt(localSettings.month) -1
						}).toString("MMMM") + " " + localSettings.year
					);
				}
			}
			var cnt = 0;
			var dayCnt = 0;
			var monthStart = false;
			calHolder.append(calTable = jQuery('<table cellpadding="0" cellspacing="0"/>').css({
				width: localSettings.width,
				height: localSettings.height
			}).attr({
				id: "calBox" + localSettings.uniqueName
			}));
			realCellHeight = $("#calBox" + localSettings.uniqueName).height() / 6;
			realCellHeight--; //hopefuly fix the 6 row scroll bar
			calTable.empty();
			for (var a = 0; a < 6; a++) {//Y
				calTable.append(jQuery('<tr id="' + localSettings.uniqueName + 'w' + a + '"/>'));
				for (var b = 0; b < 7; b++) {//X
					jQuery("#" + localSettings.uniqueName + "w" + a).append(jQuery('<td class="font white" id="' + localSettings.uniqueName + 'd' + cnt + '"/>"').css({
						fontSize: "11px",
						textAlign: "center",
						width: localSettings.cellWidth,
						height: localSettings.cellHeight,
						borderWidth: localSettings.borderWidth,
						borderStyle: localSettings.borderStyle
					}));
					var a_Pass = new Array();
					a_Pass[0] = localSettings.year == parseInt(Date.today().toString("yyyy"));
					a_Pass[1] = localSettings.year < parseInt(Date.today().toString("yyyy"));
					a_Pass[2] = a_Pass[0] && localSettings.month < parseInt(Date.today().toString("M"));
					a_Pass[3] = a_Pass[0] && localSettings.month == Date.today().toString("M") && dayCnt < parseInt(Date.today().toString("d"));
					
					if (cnt >= localSettings.startofMonth && dayCnt < localSettings.daysInMonth) {
						curDay = jQuery("#" + localSettings.uniqueName + "d" + cnt)
						dayCnt++;
						dayBG = "dark";
						if (localSettings.largeDisplay === true) {
							curDay.html($("<div/>").css({
								overflow: "hidden",
								height: "100%",
								width: "100%"
							}).html(clickArea = $("<div/>").css({
								width: "100%",
								height: "15px"
							}).addClass("border-main-1 "+dayBG).html(dayCnt))
							.append(clickArea2 = $("<div/>").css({
								overFlow: "hidden",
								width: "100%",
								height: realCellHeight - 15
							}).addClass("clickarea2 border-main-1")						//.html(localsettings.uniqueName+"d"+cnt)
							));
						}else {
							clickArea = curDay.html(dayCnt);
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
						
						clickArea.click(function(){
							if (calHolder.data("Settings").callbackFn) {
								calHolder.data("Settings").callbackFn(calHolder.data("Settings").month, $(this).text(), calHolder.data("Settings").year);
								if (calHolder.data("Settings").noClick === false) {
									calHolder.parent().fadeOut(300);
								}
							}
						});
					}
					try {
						dayTest = localSettings.daysToHighlight[parseInt(localSettings.year)][parseInt(localSettings.month)][dayCnt];
					} catch(e){ //the user is clicking too fast, lets just set it to be blank so it will pass
						dayTest = false;
					}
					if (dayTest) {
						lsdth = localSettings.daysToHighlight[parseInt(localSettings.year)][parseInt(localSettings.month)][dayCnt];
						if (localSettings.largeDisplay === true) {
							clickArea2.empty();
							ca2 = clickArea2.height() - 17;
							displayAmount = Math.round(parseInt(ca2) / 15) - 1;
							var displayCnt = 0;
							$.each(lsdth, function(i, item){
								displayCnt++;
								if (i > displayAmount) {
									return;
								}
								clickArea2.append($("<div/>").css({
									textAlign: "left",
									height: "15px",
									overflow: "hidden",
									padding: "2px",
									margin: "2px"
								}).html($("<span/>").css({
									fontSize: "9px",
									fontWeight: "bold"
								}).html(item.timeS + " - " + item.timeE)).addClass("border-theme-1 ui-corner-all").css({
									width: "90%",
									backgroundColor: localSettings.highLightColors[item.location_id-1]
								}));
							});
							
							if (displayCnt > displayAmount) {
								clickArea2.append($("<a/>").css({
									fontSize: "9px",
									fontWeight: "bold"
								}).html("&#43;" + (displayCnt - displayAmount) + " More"));
							}
							jQuery("#" + localSettings.uniqueName + "d" + cnt).attr("title", localSettings.daysToHighlight[dayCnt]);
						}
						else {
							jQuery("#" + localSettings.uniqueName + "d" + cnt).css({
								backgroundColor: localSettings.highLightColors[0]
							});
						}
					}
					cnt++;
				}
			}
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