import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks.js';

const colors = d3.scale.category10();

export default class Paths extends Component {

  constructor(props) {
    super(props);
    this.state = {
      percent: 50,
      tooltip: true
    }
  }

  updateTooltip() {
    if(this.props.tasks.length > 0 && this.state.tooltip) {
      this.props.addStep({
        title: 'Path slider',
        text: 'Move slider to see how path is being drawn dynamically',
        selector: '#slider',
        position: 'bottom'
      });
      this.setState({tooltip: false});
    }
  }

  componentDidUpdate() {
    this.updateTooltip();

    const that = this;

    if (!this.ready && this.props.tasks.length !==0) {
      const calculateCurrentPath = (path) => {
        let l = Math.round(path.length / 100 * this.state.percent);
        return path.slice(0, l)
      };

      const start = {lat: 39.11303, long: -84.51931};

      const map = new google.maps.Map(d3.select("#map").node(), {
        zoom: 8,
        center: new google.maps.LatLng(start.lat, start.long),
        mapTypeId: google.maps.MapTypeId.TERRAIN
      });

      const overlay = new google.maps.OverlayView();
      this.overlay = overlay;

      overlay.onAdd = () => {
        const layer = d3.select(overlay.getPanes().overlayLayer).append("div")
          .attr("class", "path");

        overlay.draw = () => {
          const createLinks = (p) => {
            return Array.apply(null, Array(p.length - 1)).map((_, i) => {
              return {
                source: i,
                target: i + 1
              };
            });
          };

          const pathDataset = this.props.tasks.map((task, i) => {
            let current = calculateCurrentPath(task.path);
            let links = createLinks(current);
            return {
              nodes: current,
              edges: links.map(function(l) {
                return {
                  source: current[l.source],
                  target: current[l.target]
                };
              })
            }
          });

          const projection = overlay.getProjection();

          const group = layer.selectAll("g")
            .data(pathDataset);

          group.enter()
            .append("g");

          group.exit()
            .remove();

          const key = function(d) {
            return d._id;
          };

          const line = group.selectAll("line")
            .data(function(d) {
              return d.edges;
            })
            .each(drawlink);

          line.enter()
            .append("svg")
            .attr("class", "link")
            .append("line")
            .each(drawlink)
            .transition()
            .delay(function(d, i) {
              return 1 * i;
            })
            .duration(500)
            .style('opacity', 1)
            .style('fill', 'none')
            .style('stroke', function(d, i, j) {
              return colors(j);
            });

          const label = layer.selectAll("text")
            .data(this.props.tasks, key)
            .each(setXY);

          label.enter()
          .append("svg")
          .append("text")
          .text((d) => {
            return d.text;
          })
          .each(setXY)
          .attr("font-family", "sans-serif")
          .attr("font-size", "14px")
          .attr("fill", "black");

          label.exit()
            .remove();

          const exitSelector = line.exit();

          exitSelector.transition()
            .duration(500)
            .delay(function(d, i) {
              return (exitSelector[0].length - i) * 10;
            })
            .style('opacity', 0)
            .remove();

          function latLongToPos(d) {
            var p = new google.maps.LatLng(d[0], d[1]);
            p = projection.fromLatLngToDivPixel(p);
            return p;
          }

          function drawlink(d) {
            var p1 = latLongToPos(d.source),
              p2 = latLongToPos(d.target);
            d3.select(this)
              .attr('x1', p1.x + 'px')
              .attr('y1', p1.y + 'px')
              .attr('x2', p2.x + 'px')
              .attr('y2', p2.y + 'px')
          }


          function setXY(d, i ,j) {
            var x = latLongToPos(that.props.tasks[i].path[0]).x,
              y = latLongToPos(that.props.tasks[i].path[0]).y;
            d3.select(this)
            .attr('class', 'text-svg')
            .attr('x', x)
            .attr('y', y);
          }
        }
      };

      overlay.setMap(map);
      this.ready = true;
    }
    if (this.ready && this.overlay.draw) {
      this.overlay.draw();
    }
  }

  rangeHandler(e) {
    this.setState({percent: e.target.value}, () => {
      this.overlay.draw();
    });
  }

  render() {
    return (
      <div className="paths">
        <div className={this.props.tasks.length === 0 ? 'invisible' : ''}>
          <input id="slider" value={this.state.percent} type="range" min="1" max="100" step="1" onChange={(e) => this.rangeHandler(e)}/>
          <div id="map"></div>
        </div>
      </div>
    );
  }
}

export default createContainer(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}).fetch(),
    currentUser: Meteor.user()
  };
}, Paths);