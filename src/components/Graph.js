import React from "react";
import axios from "axios";
import Chart from "chart.js/auto";

class Graph extends React.Component {
  state = {
    chartLabels: [], // x axis
    chartData: [], // y axis
    startDate: "",
    endDate: "",
    currency: "USD",
    graph: null,
  };

  componentDidMount = () => {
    this.getGraphInformation();
  };

  updateGraphState = (labelArr, dataArr) => {
    this.setState({ chartLabels: [...labelArr], chartData: [...dataArr] });
  };

  getGraphInformation = async () => {
    try {
      let response;
      if (this.state.startDate !== "" && this.state.endDate !== "") {
        response = await axios.get(
          `http://api.coindesk.com/v1/bpi/historical/close.json?start=${this.state.startDate}&end=${this.state.endDate}&currency=${this.state.currency}`
        );
      } else {
        response = await axios.get(
          `http://api.coindesk.com/v1/bpi/historical/close.json?currency=${this.state.currency}`
        );
      }
      let labelArr = [];
      let dataArr = [];
      for (let key in response.data.bpi) {
        labelArr.push(key);
        dataArr.push(response.data.bpi[key]);
      }
      this.updateGraphState(labelArr, dataArr);
    } catch (err) {
      console.error(err);
    }
  };

  // aux-method to filter the dates (updating o state)
  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  // aux-method to filter the dates (triggered by submit btn. Reloads API information)
  handleSubmitClick = (event) => {
    event.preventDefault();
    this.getGraphInformation(); // reload API
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.chartLabels !== this.state.chartLabels) {
      this.renderGraph();
    }
  };

  renderGraph = () => {
    if (this.state.graph) {
      this.state.graph.destroy();
    }
    let context = document.getElementById("graph-canvas").getContext("2d");
    const myChart = new Chart(context, {
      type: "line",
      data: {
        labels: [...this.state.chartLabels],
        datasets: [
          {
            label: `BPI - Bitcon Price Index (in ${this.state.currency})`,
            borderColor: "rgb(170, 108, 57)",
            backgroundColor: "rgb(255, 209, 170)",
            fill: true,
            data: [...this.state.chartData],
          },
        ],
      },
    });
    this.setState({ graph: myChart });
  };

  formatMoney = (value) => {
    let locale = "pt-BR";
    if (this.state.currency === "USD") {
      locale = "en-US";
    }
    return value.toLocaleString(locale, {
      style: "currency",
      currency: this.state.currency,
    });
  };

  render() {
    return (
      <div>
        <div id="filters">
          <div id="filter-dates">
            <h3>Filter by dates:</h3>
            <form onSubmit={this.handleSubmitClick}>
              <label>From: </label>
              <input
                type="date"
                onChange={this.handleChange}
                name="startDate"
                value={this.state.startDate}
              />
              <label> To: </label>
              <input
                type="date"
                onChange={this.handleChange}
                name="endDate"
                value={this.state.endDate}
              />
              <input type="submit" />
            </form>
          </div>
          <div id="filter-currency">
            <h3>Filter by currency:</h3>
            <form onSubmit={this.handleSubmitClick}>
              <select name="currency" onChange={this.handleChange}>
                <option value="USD" selected>
                  USD
                </option>
                <option value="BRL">BRL</option>
                <option value="EUR">EUR</option>
              </select>
              <input type="submit" />
            </form>
          </div>
          <div id="values-box">
            <h3>Values</h3>
            <form onSubmit={this.handleSubmitClick}>
              <p>Max: {this.formatMoney(Math.max(...this.state.chartData))}</p>
              <p>Min: {this.formatMoney(Math.min(...this.state.chartData))}</p>
            </form>
          </div>
        </div>
        <canvas id="graph-canvas"></canvas>
      </div>
    );
  }
}

export default Graph;
