import React, { useState, useEffect } from "react";
import "./SeatLayout.css"; // Import your CSS for styling
import { useNavigate } from 'react-router-dom';
import PaymentModal from "../PaymentModal/PaymentModal";
function SeatLayout(props) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user_details'));
  const isSuperUser = user && user.is_superuser;
  const token = localStorage.getItem('token')
  const { theaterdetails } = props;
  console.log(theaterdetails);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedShowTime, setSelectedShowTime] = useState();
  const [selectedShowDate, setSelectedShowDate] = useState();
  const [reservedSeat, setReservedSeat] = useState([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentKey, setPaymentKey] = useState('');
  const seatprice = 150;
  const totalPrice = seatprice * (selectedSeats.length);
  const [showtime, setShowtime] = useState([]);    
    useEffect(() => {
        // Fetch genres from the API
        fetch(`http://127.0.0.1:8000/api/movies/showtime/${3}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },}
        )
            .then((response) => response.json())
            .then((data) => {
              setShowtime(data);
            })
            .catch((error) => {
                console.error("Error fetching genres:", error);
            });
    }, [theaterdetails]);
   
    console.log(showtime)
  const handleSeatClick = (seatNumber) => {
    // Toggle seat selection
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Generate a grid of seats (you can customize this based on your needs)
  const rows = 5;
  const seatsPerRow = 10;
  const renderSeats = () => {
    const seatComponents = [];
    console.log(selectedSeats);

    // Create a set of reserved seat numbers for quick lookup
    const reservedSeatNumbers = new Set(reservedSeat.reserved_seat_numbers);

    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatNumber = `${row}-${seat}`;
        const isReserved = reservedSeatNumbers.has(seatNumber);

        seatComponents.push(
          <div
            key={seatNumber}
            className={`seat ${isReserved ? "reserved" : ""} ${selectedSeats.includes(seatNumber) ? "selected" : ""
              }`}
            onClick={() => !isReserved && handleSeatClick(seatNumber)}
          >
            {/* {seatNumber} */}
            {isReserved ? (
              <img src="https://cdn-icons-png.flaticon.com/512/1683/1683809.png" alt="Reserved Chair" style={{ width: '25px', height: '25px' }} />
            ) : (
              <img src="https://cdn-icons-png.flaticon.com/512/1683/1683809.png" alt="Empty Chair" style={{ width: '25px', height: '25px' }} />
            )}

          </div>
        );
      }
    }
    return seatComponents;
  };   

    const handleOpenPaymentModal = () => {
      setPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
      setPaymentModalOpen(false);
    };

    const handlePaymentDone = (key) => {
      setPaymentKey(key);
      setPaymentModalOpen(false);

      handleBookSeats();
    };
  
  const handleBookSeats = () => {
    if (token) {

      // Create an object with the booking data
      const bookingData = {
        theater: theaterdetails.id,
        seats: selectedSeats,
        movie: theaterdetails.movie,
        movie_timing: selectedShowTime,
        date: selectedShowDate,
        category: 'silver',
        price: 200.00,

      };
      console.log(bookingData);
      // Send a POST request to the book-seat API
      fetch('http://127.0.0.1:8000/api/movies/book-seat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      })
        .then((response) => {
          if (response.status === 201) {
            // Booking successful, you can handle this case as needed (e.g., show a confirmation message)
            navigate('/dasboard');
            console.log('Seats booked successfully');
          } else if (response.status === 400) {
            // Handle validation errors or seat availability errors
            console.log('Booking failed. One or more seats are already reserved.');
          } else {
            // Handle other errors
            navigate('/dasboard');
            console.error('Booking failed. Server error.');
          }
        })
        .catch((error) => {
          console.error('Booking failed. Network error:', error);
        });
    } else {
      navigate('/signin');

    }
  };
  useEffect(() => {
    // Fetch the unique languages from the API
    fetch(`http://127.0.0.1:8000/api/reserved-seats/${theaterdetails.id}/${theaterdetails.movie}/${selectedShowDate}/${selectedShowTime}/`)
      .then((response) => response.json())
      .then((data) => {
        setReservedSeat(data);
      })
      .catch((error) => {
        console.error("Error fetching languages:", error);
      });
  }, [selectedShowDate, selectedShowTime,theaterdetails.id,theaterdetails.movie]);
  console.log(reservedSeat);

  return (
    <>
      <div class="selectshow">
        <label htmlFor="selectedShowDate">Date</label>
        <input
          type="date"
          name="selectedShowDate"
          value={selectedShowDate}
          onChange={(e) => setSelectedShowDate(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="selectshow ">
        <label htmlFor="selectedShowTime">Show Time </label>
        <select
          name="selectedShowTime"
          value={selectedShowTime}
          onChange={(e) => setSelectedShowTime(e.target.value)}
          style={{ color: 'black' }}
        >
          <option style={{ color: 'black' }} value="">Select Show Time</option>
          {showtime.first_show!== "00:00:00" ?<option style={{ color: 'black' }} value="09:00:00.000000">09:00 AM</option>: null}
          {showtime.second_show!== "00:00:00" ?<option style={{ color: 'black' }} value="12:00:00.000000">12:00 PM</option>: null}
          {showtime.third_show!== "00:00:00" ?<option style={{ color: 'black' }} value="15:00:00.000000">03:00 PM</option>: null}
        </select>
      </div>
      <div className="seat-layout">
        <h2>Select Seat</h2>
        {/* <div className="screen">Screen</div> */}
        <div className="seats">{renderSeats()}</div>

        <div className="legend">
          <div className="legend-item">
            <div className="seat selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="seat"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat reserved"></div>
            <span>Reserved</span>
          </div>
        </div>
        <div>
          <h3>Price:{selectedSeats.length * seatprice}</h3>

        </div>

      </div>
      <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={handleClosePaymentModal}
                onPaymentDone={handlePaymentDone}
              />
              {paymentKey && <p>Payment Key: {paymentKey}</p>}
      {
        selectedSeats.length !== 0 && selectedShowDate && selectedShowTime ?
         
              <button class="btnBookTickets" onClick={handleOpenPaymentModal}>Make Pyment</button>

          // <button class="btnBookTickets" onClick={handleBookSeats}>Book Selected Seats</button>
          :
          <button class="btnBookTickets" disabled>Book Selected Seats</button>
      }

    </>
  );
}

export default SeatLayout;
