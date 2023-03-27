import React, { useState, useEffect, useRef } from "react";
import { unstable_renderSubtreeIntoContainer } from "react-dom";
import { Col, Card, Row, CardHeader, CardBody, CardFooter, Button, } from "reactstrap";

const App = () => {
  const processingTimeMS = 10000
  const orderNo = useRef(0)
  const botCounts = useRef(0)
  const [orders, setOrders] = useState([]);
  const [bots, setBots] = useState([]);

  const addOrder = (orderType) => {
    orderNo.current += 1
    let newOrderArray = orders
    let order = {
      orderCode: orderNo.current,
      type: orderType,
      vip: orderType === 'VIP',
      status: 'PENDING'
    };

    if (order.vip) {
      let vipIndex = orders.findIndex(o => o.vip === false);
      if (vipIndex >= 0) {
        newOrderArray.splice(vipIndex, 0, order);
      } else {
        setOrders(prevOrders => [...prevOrders, order]);
      }
    } else {
      setOrders(prevOrders => [...prevOrders, order]);
    }

    console.log(`Order ${order.orderCode} (${orderType}) added to queue`);
  }

  const handleAddBot = () => {
    botCounts.current += 1
    setBots([
      ...bots,
      {
        botCode: botCounts.current,
        isAvailable: true,
        processingTime: undefined
      }
    ])

  };

  const handleRemoveBot = () => {
    let newArray = bots
    newArray.pop()
    setBots([...newArray])
  };

  const processOrdersWithBots = async () => {
    const availableBots = bots.filter((bot) => bot.isAvailable);
    if (availableBots.length === 0) return;

    const pendingOrders = orders.filter((order) => order.status === "PENDING" && !bots.map((bot) => bot.orderCode).includes(order.orderCode))
    if (pendingOrders.length === 0) return;

    const newBotArray = [...bots];

    for (let order of pendingOrders) {
      for (let [idx, bot] of newBotArray.entries()) {
        if (bot.isAvailable) {
          bot.isAvailable = false;
          bot.orderCode = order.orderCode;
          bot.processingTime = processingTimeMS
          newBotArray[idx] = bot
          break;
        }
      }
    }
    setBots(newBotArray);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setBots((prevBots) =>
        prevBots.map((bot) =>
          bot.processingTime !== undefined || bot.processingTime > 0
            ? {
              ...bot,
              processingTime: bot.processingTime - 1000,
            }
            : bot,
        ),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    for (let bot of bots) {
      if (bot.processingTime !== undefined && bot.processingTime <= 0) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderCode === bot.orderCode ? { ...order, status: "COMPLETED" } : order,
          ),
        );
        setBots((prevBots) =>
          prevBots.map((prevBot) =>
            prevBot.botCode === bot.botCode
              ? {
                ...prevBot,
                isAvailable: true,
                orderCode: undefined,
                processingTime: undefined,
              }
              : prevBot,
          ),
        );
      }
    }
  }, [bots]);

  useEffect(() => {
    processOrdersWithBots();
  }, [orders, bots]);

  // useEffect(() => {
  //   console.log(bots)
  // }, [bots])

  // useEffect(() => {
  //   console.log(orders)
  // }, [orders])

  const UserComponent = () => {
    return (
      <Card>
        <CardHeader>User</CardHeader>
        <CardBody>
          <Row>
            <Col xs="6">
              <Button onClick={() => addOrder("Normal")}>
                Add Order
              </Button>
            </Col>
            <Col xs="6">
              <Button onClick={() => addOrder("VIP")}>
                Add VIP Order
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  };

  const ManagerComponent = () => {
    return (
      <Card>
        <CardHeader>Manager</CardHeader>
        <CardBody>
          <Row>
            <Col xs="6">
              <Button onClick={handleAddBot}>Add Bot</Button>
            </Col>
            <Col xs="6">
              <Button onClick={handleRemoveBot}>Remove Bot</Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  };
  return (
    <div className="App" style={{ width: "1000px", margin: "auto" }}>
      <h1>MCD Order System / Bot</h1>
      <Row>
        <Col xs="6">
          <UserComponent />
        </Col>
        <Col xs="6">
          <ManagerComponent />
        </Col>
      </Row>
      <br />
      <Card>
        <CardHeader>Main Board</CardHeader>
        <CardBody>
          <Row>
            <Col xs="4">
              <Card>
                <CardHeader>Order Pending</CardHeader>
                <CardBody>
                  {orders.filter(order => order.status === "PENDING").map((order) => (
                    <div key={order.orderCode}>
                      {order.orderCode}: {order.type} - {order.status}
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
            <Col xs="4">
              <Card>
                <CardHeader>Processing Order</CardHeader>
                <CardBody>
                  {orders.filter(order => order.status === "PROGRESSING").map((order) => (
                    <div key={order.orderCode}>
                      {order.orderCode}: {order.type} - {order.status}
                    </div>
                  ))}
                  {bots.map((bot, idx) => (
                    bot.isAvailable ?
                      <div key={idx}>
                        Bot {bot.botCode} was IDLE
                      </div>
                      : <div key={idx}>
                        Bot {bot.botCode} Processing On {bot.orderCode} (Remain Time : {bot.processingTime}ms)
                      </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
            <Col xs="4">
              <Card>
                <CardHeader>Order Done</CardHeader>
                <CardBody>
                  {orders.filter(order => order.status === "COMPLETED").map((order) => (
                    <div key={order.orderCode}>
                      {order.orderCode}: {order.type} - {order.status}
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <br />
    </div>
  );
};

export default App;
