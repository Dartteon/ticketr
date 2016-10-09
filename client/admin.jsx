'use strict';

var React = require('react');
var socket = io.connect();

var MerchantStatus = React.createClass({
	sendDecreaseTimeRequestToBackend() {
		socket.emit('changetimeperticket:decrement', null);
	},
	sendIncreaseTimeRequestToBackend() {
		socket.emit('changetimeperticket:increment', null);
	},
	sendDequeueRequestToBackend() {
		socket.emit('dequeue:nextticket', null);
	},
	render() {
		return (
			<div>
			{
				this.props.merchantData == null ?
					<div className="loading"></div>
				: <div>
							<span>Total Customers in Queue: {this.props.merchantData.total_cust_in_queue}</span>
							<span>Total Estimated Waiting Time: {this.props.merchantData.total_est_waiting_time}</span>
							<span>Time per Ticket: {this.props.merchantData.time_per_ticket}</span>
							<span>Next Ticket Number: {this.props.merchantData.next_ticket_num}</span>
					</div>
			}
			<button onClick={this.sendDecreaseTimeRequestToBackend}>
				<span> Decrease </span>
			</button>
			<button onClick={this.sendIncreaseTimeRequestToBackend}>
				<span> Increase </span>
			</button>
			<button onClick={this.sendDequeueRequestToBackend}>
				<span> Pop </span>
			</button>
			</div>
		);
	}
});

var App = React.createClass({
	getInitialState() {
		return {
			merchantData: null
		};
	},

	componentDidMount() {
		socket.on('send:merchantdata', this._receiveMerchantData);
		this.sendMerchantIdToBackend();
	},

	_receiveMerchantData(data) {
		var merchantData = data;
		this.setState({merchantData: merchantData});
	},

	sendMerchantIdToBackend() {
		socket.emit('receive:merchantid', null);
	},

	render() {
		return (
			<div>
				<MerchantStatus
					merchantData={this.state.merchantData}
				/>
			</div>
		);
	}
});

React.render(<App/>, document.getElementById('app'));
