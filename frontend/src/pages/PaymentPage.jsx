import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Lock } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ bookingId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log("Creating payment intent for:", { bookingId, amount });
        const response = await api.post("/bookings/create-payment-intent", {
          booking_id: bookingId,
          amount: amount,
        });
        console.log("Payment intent response:", response.data);
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error("Payment intent error:", err);
        toast.error("Failed to initialize payment");
      }
    };

    if (bookingId && amount > 0) {
      createPaymentIntent();
    }
  }, [bookingId, amount]);

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
        payment_method: {
          card: cardElement,
        },
      },
    );

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else if (paymentIntent.status === "succeeded") {
      // Update booking payment status
      try {
        await api.put(`/bookings/confirm-payment/${bookingId}`, {
          payment_intent_id: paymentIntent.id,
        });
        toast.success("Payment successful!");
        onSuccess();
      } catch (err) {
        toast.error("Payment confirmed but booking update failed");
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-xl p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" },
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${amount?.toFixed(2) || "0.00"}
          </>
        )}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Get booking data from navigation state
    if (location.state) {
      setBookingData(location.state);
    } else {
      toast.error("Invalid payment session");
      navigate("/");
    }
  }, [location]);

  const handlePaymentSuccess = () => {
    toast.success("Payment completed!");
    navigate("/my-bookings");
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">Booking Code</p>
            <p className="font-mono font-bold text-orange-600">
              {bookingData.bookingCode}
            </p>
            <div className="flex justify-between mt-3 pt-3 border-t">
              <span className="font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-orange-600">
                ${bookingData.amount.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {bookingData.ticketCount} x {bookingData.ticketType} tickets
            </p>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentForm
              bookingId={bookingData.bookingId}
              amount={bookingData.amount}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
