import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import List from './Components/List/List';
import Navbar from './Components/Navbar/Navbar';

function App() {
  const statusList = ['In progress', 'Backlog', 'Todo', 'Done', 'Cancelled'];
  const userList = ['Anoop Sharma', 'Yogesh', 'Shankar Kumar', 'Ramesh', 'Suresh'];
  const priorityList = [
    { name: 'No priority', priority: 0 },
    { name: 'Low', priority: 1 },
    { name: 'Medium', priority: 2 },
    { name: 'High', priority: 3 },
    { name: 'Urgent', priority: 4 },
  ];

  const [groupValue, setGroupValue] = useState(getStateFromLocalStorage() || 'status');
  const [orderValue, setOrderValue] = useState('title');
  const [ticketDetails, setTicketDetails] = useState([]);

  const orderDataByValue = useCallback(async (cardsArray) => {
    if (orderValue === 'priority') {
      cardsArray.sort((a, b) => b.priority - a.priority);
    } else if (orderValue === 'title') {
      cardsArray.sort((a, b) => a.title.localeCompare(b.title));
    }
    setTicketDetails([...cardsArray]);
  }, [orderValue, setTicketDetails]);

  function saveStateToLocalStorage(state) {
    localStorage.setItem('groupValue', JSON.stringify(state));
  }

  function getStateFromLocalStorage() {
    const storedState = localStorage.getItem('groupValue');
    return storedState ? JSON.parse(storedState) : null;
  }

  useEffect(() => {
    saveStateToLocalStorage(groupValue);
    async function fetchData() {
      try {
        const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        refactorData(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    async function refactorData(response) {
      let ticketArray = [];
      if (response.status === 200) {
        response.data.tickets.forEach((ticket) => {
          const userObj = response.data.users.find((user) => user.id === ticket.userId);
          if (userObj) {
            ticketArray.push({ ...ticket, userObj });
          }
        });
      }
      setTicketDetails([...ticketArray]);
      orderDataByValue(ticketArray);
    }

    fetchData();
  }, [orderDataByValue, groupValue]);

  function handleGroupValue(value) {
    setGroupValue(value);
  }

  function handleOrderValue(value) {
    setOrderValue(value);
  }

  return (
    <>
      <Navbar
        groupValue={groupValue}
        orderValue={orderValue}
        handleGroupValue={handleGroupValue}
        handleOrderValue={handleOrderValue}
      />
      <section className="board-details">
        <div className="board-details-list">
          {(() => {
            switch (groupValue) {
              case 'status':
                return statusList.map((listItem) => (
                  <List
                    key={listItem}
                    groupValue="status"
                    orderValue={orderValue}
                    listTitle={listItem}
                    listIcon=""
                    statusList={statusList}
                    ticketDetails={ticketDetails}
                  />
                ));
              case 'user':
                return userList.map((listItem) => (
                  <List
                    key={listItem}
                    groupValue="user"
                    orderValue={orderValue}
                    listTitle={listItem}
                    listIcon=""
                    userList={userList}
                    ticketDetails={ticketDetails}
                  />
                ));
              case 'priority':
                return priorityList.map((listItem) => (
                  <List
                    key={listItem.priority}
                    groupValue="priority"
                    orderValue={orderValue}
                    listTitle={listItem.priority}
                    listIcon=""
                    priorityList={priorityList}
                    ticketDetails={ticketDetails}
                  />
                ));
              default:
                return null;
            }
          })()}
        </div>
      </section>
    </>
  );
}

export default App;
