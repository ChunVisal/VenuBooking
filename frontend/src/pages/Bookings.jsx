import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Loader2,
  Calendar,
  MapPin,
  ArrowLeft,
  Ticket,
  CreditCard,
  Lock,
} from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment Form Component
const PaymentForm = ({
  eventId,
  ticketCount,
  totalAmount,
  onSuccess,
  onBack,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setError(null);
        const response = await api.post("/bookings/create-payment-intent", {
          event_id: eventId,
          ticket_count: ticketCount,
          ticket_type: "regular",
        });

        console.log("Payment intent response:", response.data);
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error("Payment intent error:", err);
        setError(err.response?.data?.error || "Failed to initialize payment");
        toast.error("Failed to initialize payment");
      }
    };

    createPaymentIntent();
  }, [eventId, ticketCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe not loaded");
      return;
    }

    if (!clientSecret) {
      toast.error("Payment not initialized");
      return;
    }

    setLoading(true);
    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: { card: cardElement },
      },
    );

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else if (paymentIntent.status === "succeeded") {
      try {
        // Create booking after payment
        await api.post("/bookings/create", {
          event_id: eventId,
          ticket_count: ticketCount,
          payment_intent_id: paymentIntent.id,
        });

        toast.success("Payment successful! Booking confirmed.");
        onSuccess();
      } catch (err) {
        console.error("Booking creation error:", err);
        toast.error(
          err.response?.data?.error || "Payment succeeded but booking failed",
        );
        setLoading(false);
      }
    }
  };

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={onBack} className="text-orange-500">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-xl p-4">
        <CardElement
          options={{
            style: {
              base: { fontSize: "16px", color: "#424770" },
            },
          }}
        />
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border rounded-xl"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading || !clientSecret}
          className="flex-1 bg-orange-500 text-white py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
          Pay ${totalAmount.toFixed(2)}
        </button>
      </div>
    </form>
  );
};

// Main Booking Component
const BookingPage = () => {
  const { eventId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [step, setStep] = useState(1);
  const [existingBooking, setExistingBooking] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please login");
      navigate("/login");
      return;
    }
    fetchEvent();
    checkExistingBooking();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (err) {
      toast.error("Failed to load event");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingBooking = async () => {
    try {
      const response = await api.get("/bookings/my-bookings");
      const existing = response.data.find(
        (b) => b.event_id === parseInt(eventId),
      );
      if (existing) {
        setExistingBooking(existing);
      }
    } catch (err) {
      console.error("Error checking bookings:", err);
    }
  };

  const isFreeEvent = () => {
    return !event?.price || parseFloat(event.price) === 0;
  };

  const totalAmount = () => {
    return parseFloat(event?.price || 0) * ticketCount;
  };

  const handleFreeBooking = async () => {
    try {
      await api.post("/bookings/create-free", {
        event_id: eventId,
        ticket_count: ticketCount,
      });
      toast.success("Free tickets booked!");
      navigate("/my-bookings");
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("You have already booked this event");
        checkExistingBooking();
      } else {
        toast.error(err.response?.data?.error || "Booking failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  // Show if already booked
  if (existingBooking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Ticket className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Already Booked! 🎉</h2>
            <p className="text-gray-600 mb-4">
              You have already booked tickets for this event.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500">Booking Code</p>
              <p className="font-mono font-bold text-orange-600">
                {existingBooking.booking_code}
              </p>
              <p className="text-sm mt-2">
                {existingBooking.ticket_count} tickets
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/my-bookings"
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold"
              >
                View My Bookings
              </Link>
              <Link
                to="/"
                className="flex-1 border py-3 rounded-xl font-semibold"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          to={`/event/${eventId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Event
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4">{event.title}</h1>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{event.venue || "TBA"}</span>
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Ticket Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">
                    {ticketCount}
                  </span>
                  <button
                    onClick={() => setTicketCount(ticketCount + 1)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {isFreeEvent() ? "FREE" : `$${totalAmount().toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Booking Button */}
              {isFreeEvent() ? (
                <button
                  onClick={handleFreeBooking}
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  Get Free Tickets
                </button>
              ) : (
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment - ${totalAmount().toFixed(2)}
                </button>
              )}
            </>
          ) : (
            <Elements stripe={stripePromise}>
              <PaymentForm
                eventId={eventId}
                ticketCount={ticketCount}
                totalAmount={totalAmount()}
                onSuccess={() => navigate("/my-bookings")}
                onBack={() => setStep(1)}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
