/**
 * Item Name  : 
 *Creator         :cc
 *Email            :cc
 *Created Date:2017.3.29.
 *@pararm     :
 */
(function($, window) {
  function GD_fence_set(opts) {
    this.id = opts.id;
    this.sn = opts.sn;

    // 鼠标操作工具
    this.mouse_tools = null;
    // 围栏的默认样式
    this.styleOptions = {
      strokeColor: "blue", //边线颜色。
      fillColor: "blue", //填充颜色。当参数为空时，圆形将没有填充效果。
      strokeWeight: 1, //边线的宽度，以像素为单位。
      strokeOpacity: 0.5, //边线透明度，取值范围0 - 1。
      fillOpacity: 0.1, //填充的透明度，取值范围0 - 1。
      strokeStyle: 'solid' //边线的样式，solid或dashed。
    };
    // 编辑围栏的样式
    this.editOptions = {
      strokeColor: "red", //边线颜色。
      fillColor: "red", //填充颜色。当参数为空时，圆形将没有填充效果。
      strokeWeight: 1, //边线的宽度，以像素为单位。
      strokeOpacity: 0.5, //边线透明度，取值范围0 - 1。
      fillOpacity: 0.1, //填充的透明度，取值范围0 - 1。
      strokeStyle: 'solid' //边线的样式，solid或dashed。
    };
    // 点击的当前围栏
    this.active_f = null;
  };
  GD_fence_set.prototype = {
    //面向对象初始化
    init: function() {
      var me = this;
      me.init_Baner(); //开启控件
      setTimeout(function() {
        me.init_event();
      }, 500);
    },
    //控件默认初始化
    init_Baner: function() {
      var me = this;
      var map = me.map = new AMap.Map(me.id, {
        // mapStyle:'dark',
        // features:[]
      });
      map.setZoomAndCenter(11, [116.404, 39.915]);
    },
    init_event: function() {
      var me = this;
      me.fence_bind();
      me.fence();
    },
    fence: function() {
      var me = this;
      me.f_init();
    },
    fence_bind: function() {
      var me = this;
      var fn = {
        f_init: function() {
          var me = this;
          me._add();
          me._tool();
          me._show();
        },
        // *-----------------------------------------------tool
        _tool: function() {
          var me = this;
          me.map.plugin(["AMap.MouseTool"], function() {
            me.mouse_tools = new AMap.MouseTool(me.map);
            me._tool_done();
          });
        },
        _tool_done: function() {
          var me = this;
          me.mouse_tools.on('draw', function(data) {
            me.mouse_tools.close();
            me.map.setDefaultCursor("pointer");

            var dom = data.obj;

            dom.f_name = me.f_name;
            dom.f_type = me.f_type;
            dom.f_alarm = me.f_alarm;

            me._tool_done_save(dom);
          });
        },
        _tool_done_save: function(marker) {
          var me = this;
          var opts = null;
          // 圆形数据
          if (marker.f_type == 0) {
            opts = {
              sn: me.sn,
              f_name: marker.f_name,
              center: JSON.stringify([marker.getCenter().lng, marker.getCenter().lat]),
              radius: parseInt(marker.getRadius()),
              f_alarm: marker.f_alarm,
              f_type: marker.f_type + ""
            };
          }
          // duo
          else if (marker.f_type == 2) {
            var p_arr = marker.getPath();
            var region = [];
            for (var j = 0; j < p_arr.length; j++) {
              region.push({ lng: p_arr[j].lng, lat: p_arr[j].lat });
            }
            opts = {
              sn: me.sn,
              f_name: marker.f_name,
              region: JSON.stringify(region),
              f_alarm: marker.f_alarm,
              f_type: marker.f_type + ""
            };
          }
          console.log(opts);
          // 发生完毕数据加载所有
          me._show();
          me._add();
        },
        // -------------------------------------------------显示
        _show: function() {
          var me = this;
          var data = {
            fences: [{
              id: 1,
              center: [116.225472, 39.940538],
              f_alarm: 0,
              f_name: "cc",
              f_type: 0,
              radius: 7340
            }, {
              id: 2,
              f_alarm: 1,
              f_name: "cc",
              f_type: 2,
              region: [{ "lng": 116.250191, "lat": 40.027349 }, { "lng": 116.381341, "lat": 40.074653 }, { "lng": 116.533776, "lat": 39.950014 }, { "lng": 116.232339, "lat": 39.845183 }]
            }],
          };
          var items = data.fences;

          me.map.clearMap();
          if (items.length == 0) {
            layer.msg('该设备没有设置电子围栏！');
            return;
          }
          items.forEach(function(item) {
            // 圆形
            if (item.f_type == 0) {
              me._show_yuan(item);
            }
            // 多边形
            else if (item.f_type == 2) {
              me._show_duo(item);
            }
          });
          // 展示的显示和编辑
          me._show_e();
        },
        // 圆形展示
        _show_yuan: function(data) {
          var me = this;
          var center = new AMap.LngLat(data.center[0], data.center[1])
          var opts = me.styleOptions;
          opts.map = me.map;
          opts.center = center;
          opts.radius = data.radius;

          var marker = new AMap.Circle(opts);

          marker.id = data.id;
          marker.f_name = data.f_name;
          marker.f_alarm = data.f_alarm;
          marker.f_type = data.f_type;
        },
        // 多边形
        _show_duo: function(data) {
          var me = this;
          var path = [];
          for (var i = 0; i < data.region.length; i++) {
            var p = data.region[i];
            path.push(new AMap.LngLat(p.lng, p.lat));
          }
          var opts = me.styleOptions;
          opts.map = me.map;
          opts.path = path;

          var marker = new AMap.Polygon(opts);

          marker.id = data.id;
          marker.f_name = data.f_name;
          marker.f_alarm = data.f_alarm;
          marker.f_type = data.f_type;
        },
        _show_e: function() {
          var me = this;
          var all_f = me.map.getAllOverlays();
          // 显示信息事件
          me._mouseover(all_f);
          // 所有围栏的点击事件
          me._click(all_f);

        },
        // -----------------------------------------------------------显示功能
        _mouseover: function(arr) {
          var me = this;
          for (var i = 0; i < arr.length; i++) {
            arr[i].off('mouseover');
            arr[i].on('mouseover', function(e) {

              e.target.indexLayer = layer.msg('围栏名称：' + e.target.f_name + '<span style="margin-left:20px;">' +
                '</span>报警条件：' + (e.target.f_alarm == 0 ? '出围栏报警' : '入围栏报警'), {
                  time: 0, //不自动关闭
                });
            });
            arr[i].off('mouseout');
            arr[i].on('mouseout', function(e) {
              layer.close(e.target.indexLayer);
            });
          }
        },
        // -----------------------------------------------------------编辑功能
        _click: function(arr) {
          var me = this;
          for (var i = 0; i < arr.length; i++) {
            arr[i].off('click');
            arr[i].on('click', function(e) {
              // 没有记录点击的围栏
              if (me.active_f == null) {
                // 收集当前围栏
                me.active_f = e.target;
                // console.log(e);
                me._edit(e.target);
              }
              // 记录点击的围栏
              else {
                layer.msg('请完成围栏编辑，在进行其他操作！')
              }
            });
          }
        },
        // 编辑围栏
        _edit: function(dom) {
          /* body... */
          var me = this;
          // 编辑删除按钮显示
          $('#f_opt').hide();
          $('#f_opt_save').show();
          $('#f_opt_del').show().css('left', '92px');

          // yuan
          if (dom.f_type == 0) {
            me._edit_mode("AMap.CircleEditor", dom);
          }
          // duo
          else if (dom.f_type == 2) {
            me._edit_mode("AMap.PolyEditor", dom);
          }

        },
        _edit_mode: function(mode, dom) {
          var me = this;
          me.map.plugin([mode], function() {
            // yuan
            if (dom.f_type == 0) {
              me.mode = new AMap.CircleEditor(me.map, dom);
            }
            // duo
            else if (dom.f_type == 2) {
              me.mode = new AMap.PolyEditor(me.map, dom);
            }
            me.mode.open();
            dom.setOptions(me.editOptions);

            // 编辑围栏
            me._edit_save(dom);
            // 删除围栏
            me._edit_del(dom);
          });
        },
        // -----------------------------------------------------------跟新围栏
        _edit_save: function(dom) {
          var me = this;
          $('#f_opt_save').unbind().on('click', function() {

            var ck = '';
            if (dom.f_alarm == 0) {
              ck = '<input name = "alarm" type = "radio" value = "0" checked = "checked" /><span class="f_p_one">出围栏报警</span>' +
                '<input name = "alarm" type = "radio" value = "1" /><span class="f_p_one">入围栏报警</span>';
            } else if (dom.f_alarm == 1) {
              ck = '<input name = "alarm" type = "radio" value = "0" /><span class="f_p_one">出围栏报警</span>' +
                '<input name = "alarm" type = "radio" value = "1" checked = "checked" /><span class="f_p_one">入围栏报警</span>';
            }
            var str = '' +
              '<p  class="f_p">' +
              '<span> 围栏名称： </span>' +
              '<input name = "type" type = "text" value=' + dom.f_name + ' id = "f_name"/>' +
              '</p>' +
              '<p id = "alarm" class="f_p">' +
              '<span> 报警条件： </span>' +
              ck +
              '</p>';
            layer.open({
              type: 1,
              title: '修改围栏',
              area: ['350px', '180px'],
              zIndex: 600,
              shadeClose: false, //点击遮罩关闭
              content: str,
              btn: ['保存', '取消'],
              success: function() {},
              yes: function(index, layero) {
                // 重新拿下原来的值
                if ($('#f_name').val() == '') {
                  layer.msg('围栏名称不能为空！');
                  return;
                }
                dom.f_name = $('#f_name').val();
                dom.f_alarm = $('#alarm input[name="alarm"]:checked').val();
                // 保存围栏
                me._edit_save_done(dom, index);
              },
              btn2: function(index, layero) {
                layer.close(index);
              }
            });
          })
        },
        // 
        _edit_save_done: function(marker, index) {
          /* body... */
          var me = this;
          var opts = null;
          // 圆形数据
          if (marker.f_type == 0) {
            opts = {
              id: marker.id,
              f_name: marker.f_name,
              center: JSON.stringify([marker.getCenter().lng, marker.getCenter().lat]),
              radius: parseInt(marker.getRadius()),
              f_alarm: marker.f_alarm,
              f_type: marker.f_type + ""
            };
          }
          // duo
          else if (marker.f_type == 2) {
            var p_arr = marker.getPath();
            var region = [];
            for (var j = 0; j < p_arr.length; j++) {
              region.push({ lng: p_arr[j].lng, lat: p_arr[j].lat });
            }
            opts = {
              id: marker.id,
              f_name: marker.name,
              region: JSON.stringify(region),
              f_alarm: marker.f_alarm,
              f_type: marker.f_type + ""
            };
          }
          // 确认编辑
          me._edit_done(marker,opts,index);
        },
        // -----------------------------------------------------------删除围栏
        _edit_del: function(dom) {
          var me = this;
          $('#f_opt_del').unbind().on('click', function() {
            layer.open({
              type: 1,
              title: '删除围栏',
              area: ['220px', '130px'],
              zIndex: 500,
              shadeClose: false, //点击遮罩关闭
              content: '<div style="margin-left: 30px; margin-top: 10px">确认删除围栏？</div>',
              btn: ['确认', '取消'],
              yes: function(index, layero) {
                var opts = {
                  id: dom.id
                };

                me._edit_done(dom,opts,index)
              },
              btn2: function(index, layero) {
                layer.close(index);
              }
            });
          })
        },
        // -------------------------------------------------edit--done
        _edit_done: function(marker,opts,index) {
          var me = this;
          console.log(opts);
          // 关闭模式
          me.mode.close();
          layer.close(index);
          marker.setOptions(me.styleOptions);
          // 清空容器
          me.active_f = null;
          $('#f_opt').show();
          $('#f_opt_save').hide();
          $('#f_opt_del').hide();

          me._show();
          me._add();
        },
        // *------------------------------------------------添加
        _add: function() {
          var me = this;
          $('#f_opt').show();
          var str = '' +
            '<p  class="f_p">' +
            '<span> 围栏名称： </span>' +
            '<input name = "type" type = "text"  id = "f_name"/>' +
            '</p>' +
            '<p id = "type" class="f_p">' +
            '<span> 创建形状： </span>' +
            '<input name = "type" type = "radio" value = "0"  checked = "checked" /><span class="f_p_one">圆形</span>' +
            '<input name = "type" type = "radio" value = "2" /><span class="f_p_one">多边形</span>' +
            '</p>' +
            '<p id = "alarm" class="f_p">' +
            '<span> 报警条件： </span>' +
            '<input name = "alarm" type = "radio" value = "0" checked = "checked" /><span class="f_p_one">出围栏报警</span>' +
            '<input name = "alarm" type = "radio"value = "1" /><span class="f_p_one">入围栏报警</span>' +
            '</p>';
          $('#f_opt').unbind().on('click', function() {
            layer.open({
              type: 1,
              title: '新增围栏',
              area: ['350px', '200px'],
              zIndex: 500,
              shadeClose: false, //点击遮罩关闭
              content: str,
              btn: ['保存', '取消'],
              success: function() {
                //me.layer_man_dataBack();
              },
              yes: function(index, layero) {
                me._add_yes(index);
              },
              btn2: function(index, layero) {
                layer.close(index);
              }
            });
          });
        },
        _add_yes: function(index) {
          var me = this;
          $('#f_opt').hide();

          var type = me.f_type = $('#type input[name="type"]:checked').val();

          me.f_name = $('#f_name').val();
          me.f_alarm = $('#alarm input[name="alarm"]:checked').val();

          if ($('#f_name').val() == '') {
            layer.msg('围栏名称不能为空！');
            return;
          }
          // 圆形
          if (type == 0) {
            me.f_add_yuan();
          }
          // 多边形
          else if (type == 2) {
            layer.msg('温馨提示：结束多边形绘制，请双击鼠标！');
            me.f_add_duo();
          }
          // 关闭弹窗
          layer.close(index);
        },
        // 添加圆形
        f_add_yuan: function() {
          // body... 
          var me = this;
          me.map.setDefaultCursor("crosshair");
          me.mouse_tools.circle(me.styleOptions);
        },
        // 添加多边形
        f_add_duo: function(argument) {
          me.map.setDefaultCursor("crosshair");
          me.mouse_tools.polygon(me.styleOptions);
        },


      };
      for (k in fn) {
        me[k] = fn[k];
      };
    },
  };
  window["GD_fence_set"] = GD_fence_set;
})(jQuery, window);
