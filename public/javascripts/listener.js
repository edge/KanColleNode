function update_material (data) {
	for (key in data)
		$('.amount', '.test_division#resource>#res'+key).text(data[key])
}

function update_basic (data) {
  for (key in data)
    $('#'+key, '#tab_basic').text(data[key])    
}

var fleetTableRowHtml = '<tr>'
                      + '<td class="col-md-4">'
                      +   '<span class="ship_name"></span>'
                      +   '</br>'
                      +   '<span class="ship_type"></span>'
                      + '</td>'
                      + '<td class="col-md-4">'
                      +   '<span class="ship_level"></span>'
                      +   '</br>'
                      +   '<span class="exp_next"></span>'
                      + '</td>'
                      + '<td class="col-md-6">'
                      +   '<span class="ship_health_number"></span>'
                      +   '</br>'
                      +   '<span class="ship_health"></span>'
                      + '</td>'
                      + '<td class="ship_condition col-md-2"></td>'
                      + '</tr>'
var fleetTimers = {}
var expeditionTimers = {}

function updateFleet (data) {
  for (var i in data) {
    fleetNum = parseInt(i)+1
    $fleetNameSpan = $( '.fleet_tab>a[href="#fleet_'
                      + fleetNum + '"]>span:last-child')

    // console.log($fleetNameSpan)
    $fleetNameSpan.text(data[i].name)
    $fleetTable = $('#fleet_' + fleetNum + '>table>tbody', '#tab_fleet')
    $fleetTable.html(Array(data[i].ships.length+1).join(fleetTableRowHtml))

    $fleetStatus = $('#fleet_' + fleetNum + '>.fleet_status', '#tab_fleet')
    

    clearInterval(fleetTimers[i])
    clearInterval(expeditionTimers[i])
    $('.status_timer', $fleetStatus).hide()

    if (data[i].mission[0] != 0) {
      $('.status_detail', $fleetStatus).text( '#' + data[i].mission[1] 
                                            + ' '
                                            + data[i].mission_name
                                            + ' - ')
      if (data[i].mission[0] == 1) {
        $('.status_info', $fleetStatus).text('远征中')
        $fleetStatus.attr('class', 'fleet_status alert alert-info')
        fleetTimers[i] = setTimer( $('.status_timer', $fleetStatus)
                                 , data[i].mission[2])

        $eTime = $( '.expedition_table>tbody>tr:nth-child('
                          + (fleetNum-1)+')>.time')
        $eTime.hide()
        expeditionTimers[i] = setTimer($eTime, data[i].mission[2])

      }
      else {
        $('.status_info', $fleetStatus).text('远征归来')
        $fleetStatus.attr('class', 'fleet_status alert alert-warning')
      }
    }
    else {

      moderate = 0
      major = 0
      tired = 0
      almostTired = 0
      ok = 0
      min_cond = 101
      for (var j in data[i].ships) {
        ship = data[i].ships[j]

        if (ship.condition < 49)
          if (ship.condition < 40)
            if (ship.condition < 30)
              tired++
            else
              almostTired++
          else
            ok++

        if (ship.condition < min_cond)
          min_cond = ship.condition
        
        percentage = ship.current_hp / ship.max_hp
        if (percentage < 0.25) major++
      }

      $detail = $('.status_detail', $fleetStatus)
      if (major  > 0) {
        $detail.text('船只大破')
        $fleetStatus.attr('class', 'fleet_status alert alert-danger')
      }
      else if (tired > 0 || almostTired > 0 || ok > 0) {
        $detail.text('疲劳恢复中 -')
        if (tired > 0 || almostTired > 0)
          $fleetStatus.attr('class', 'fleet_status alert alert-warning')
        else
          $fleetStatus.attr('class', 'fleet_status alert alert-success')
        d = new Date()
        fleetTimers[i] = setTimer( $('.status_timer', $fleetStatus)
                                 , d.getTime()+Math.ceil((49 - min_cond)/3)*180000)
      } else {
        $detail.text('可以出击')
        $fleetStatus.attr('class', 'fleet_status alert alert-success')
      }
      $('.status_info', $fleetStatus).text('母港待命')
    }



    for (var j in data[i].ships) {
      ship = parseInt(j)+1
      $row = $('tr:nth-child('+ship+')', $fleetTable)
      if (data[i].ships[j]) {
        $('.ship_name', $row).text(data[i].ships[j].name)
        $('.ship_type', $row).text(data[i].ships[j].type)
        $('.ship_level', $row).text('LV.'+data[i].ships[j].level)
        $('.exp_next', $row).text('Next: '+data[i].ships[j].exp[1]) 
        $('.ship_condition', $row).html(
          getLabelHtml(data[i].ships[j].condition))
        $('.ship_health_number', $row).text('HP: '
                                           + data[i].ships[j].current_hp
                                           + '/' +data[i].ships[j].max_hp)
        $('.ship_health', $row).html(
          getProgressBarHtml( data[i].ships[j].max_hp
                            , data[i].ships[j].current_hp)
        )
      }        
    }
  }
}

var repairTimers = {}

function updateRepair (data) {
  for (var i in data) {
    
    $row = $('.repair_table>tbody>tr:nth-child('+i+')')
    $name = $('.ship', $row)
    $time = $('.time', $row)
    clearInterval(repairTimers[i])
    $time.hide()
    switch (data[i].state) {
      case 'occupied':
        $name.text(data[i].ship.name)
        repairTimers[i] = setTimer($time, data[i].complete_time)
        break;
      case 'empty':
        $name.text('空闲')
        break;
      case 'locked':
        $name.text('未解锁')
        break;
    }
  }
}

function setTimer ($timer, time) {
  $timer.show()
  var countdown = setInterval(function () {
    d = new Date()
    remaining = Math.floor((time - d.getTime())/1000)
    if (remaining <= 0) {
      clearInterval(countdown)
      return
    }
    h = (Math.floor(remaining / 3600) + 100).toString().substr(-2, 2)
    m = (Math.floor((remaining % 3600)/60) +100).toString().substr(-2, 2)
    s = (remaining % 60 + 100).toString().substr(-2, 2)
    remainStr = [h, m, s].join(':')
    $timer.text(remainStr)
  }, 500)
  return countdown
}

function getProgressBarHtml (max, now) {
  var percentage = now/max*100
    , color = ""

  if (percentage > 75)
    color = "green"
  else if (percentage > 50)
    color = "yellow"
  else if (percentage > 25)
    color = "orange"
  else
    color = "red"

  res = '<div class="progress health_bar">'
      + '<div class="progress-bar"'
      +     ' role="progressbar"'
      +     ' aria-valuemax="'+ max + '"'
      +     ' aria-valuemin="0"'
      +     ' aria-valuenow="'+ now + '"'
      +     ' style="width:'+percentage+'%;'
      +             'background-image:none;'
      +             'background-color:'+color+'">'
      + '</div></div>'
  return res
}

function getLabelHtml (cond) {
  if (cond > 49)
    color = 'yellow'
  else if (cond > 39)
    color = 'grey'
  else if (cond > 29)
    color = '#F5DEB3'
  else if (cond > 19)
    color = 'orange'
  else 
    color = 'red'

  if (color == 'yellow')
    textColor = 'orange'
  else
    textColor = 'white'

  res = '<span class="label" '
      +       'style="background-color:' + color + ';'
      +              'color:' + textColor + ';">'
      +  cond + '</span>'
  return res
}