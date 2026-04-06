import { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig";
import QRCode from "qrcode";
import {
  Loader2,
  Calendar,
  MapPin,
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  QrCode,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Receipt,
  CalendarDays,
  MapPinned,
  Users,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { currentUser } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [qrCodes, setQrCodes] = useState({});

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings/my-bookings");
      setBookings(response.data);

      // Generate QR codes for all tickets
      response.data.forEach((booking) => {
        booking.tickets?.forEach((ticket) => {
          generateQRCode(ticket);
        });
      });
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (ticket) => {
    if (!qrCodes[ticket.id]) {
      try {
        // Create QR code data with ticket info
        const qrData = JSON.stringify({
          ticket_code: ticket.ticket_code,
          event_title: ticket.event_title,
          ticket_type: ticket.ticket_type,
          attendee: currentUser?.username,
          booking_code: ticket.booking_code,
          timestamp: new Date().toISOString(),
        });

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        });

        setQrCodes((prev) => ({ ...prev, [ticket.id]: qrCodeDataUrl }));
      } catch (err) {
        console.error("QR generation failed:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const downloadTicket = (ticket, event) => {
    const eventDate = formatDate(event.event_date);
    const qrCodeUrl = qrCodes[ticket.id];

    const ticketHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${event.event_title} - Ticket</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }
        
        .ticket {
          max-width: 550px;
          width: 100%;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
        }
        
        .ticket::before,
        .ticket::after {
          content: '';
          position: absolute;
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 50%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
        }
        
        .ticket::before { top: -15px; }
        .ticket::after { bottom: -15px; }
        
        .ticket-header {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          padding: 32px 24px;
          text-align: center;
          position: relative;
        }
        
        .event-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 6px 12px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          margin-bottom: 16px;
        }
        
        .event-title {
          color: white;
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 12px;
        }
        
        .event-subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
        }
        
        .ticket-body {
          padding: 32px 24px;
          background: white;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .info-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #f97316;
        }
        
        .info-value {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.3;
        }
        
        .info-value-small {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
        }
        
        .ticket-code {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          margin-bottom: 24px;
          border: 1px solid #fbbf24;
        }
        
        .ticket-code-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #92400e;
          margin-bottom: 8px;
        }
        
        .ticket-code-value {
          font-family: 'Courier New', monospace;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #d97706;
          word-break: break-all;
        }
        
        .qr-section {
          background: #f9fafb;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          border: 2px dashed #e5e7eb;
          margin-bottom: 24px;
        }
        
        .qr-image {
          width: 150px;
          height: 150px;
          margin: 0 auto 12px;
          display: block;
        }
        
        .qr-note {
          font-size: 10px;
          color: #9ca3af;
          margin-top: 12px;
        }
        
        .barcode {
          margin-top: 16px;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 8px;
          text-align: center;
        }
        
        .barcode-lines {
          display: flex;
          justify-content: center;
          gap: 2px;
          margin-bottom: 8px;
        }
        
        .barcode-line {
          width: 3px;
          background: #1f2937;
        }
        
        .barcode-text {
          font-family: monospace;
          font-size: 10px;
          color: #6b7280;
        }
        
        .ticket-footer {
          background: #f9fafb;
          padding: 20px 24px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.5;
        }
        
        .footer-text strong {
          color: #f97316;
        }
        
        @media (max-width: 480px) {
          .info-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .event-title {
            font-size: 22px;
          }
          .ticket-code-value {
            font-size: 18px;
          }
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="ticket-header">
          <span class="event-badge">🎫 ENTRY TICKET</span>
          <h1 class="event-title">${escapeHtml(event.event_title)}</h1>
          <p class="event-subtitle">Digital Ticket • Valid for One Entry</p>
        </div>
        
        <div class="ticket-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">📅 DATE & TIME</span>
              <span class="info-value">${eventDate.date}</span>
              <span class="info-value-small">${eventDate.time}</span>
            </div>
            <div class="info-item">
              <span class="info-label">📍 VENUE</span>
              <span class="info-value">${escapeHtml(event.event_venue || "To Be Announced")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">🎟️ TICKET TYPE</span>
              <span class="info-value">${ticket.ticket_type.toUpperCase()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">👤 ATTENDEE</span>
              <span class="info-value">${escapeHtml(currentUser?.username || "Guest")}</span>
            </div>
          </div>
          
          <div class="ticket-code">
            <div class="ticket-code-label">TICKET CODE</div>
            <div class="ticket-code-value">${ticket.ticket_code}</div>
          </div>
          
          <div class="qr-section">
            ${qrCodeUrl ? `<img src="${qrCodeUrl}" class="qr-image" alt="QR Code" />` : '<div class="qr-placeholder">QR Code Placeholder</div>'}
            <div class="qr-note">Scan this QR code at the entrance for verification</div>
          </div>
        </div>
        
        <div class="ticket-footer">
          <div class="footer-text">
            <strong>${event.event_title}</strong><br>
            This ticket is non-transferable. Please present this digital ticket<br>
            along with a valid ID at the entrance.<br>
            Booking Reference: <strong>${event.booking_code}</strong>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    const blob = new Blob([ticketHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ticket_${event.event_title.replace(/[^a-z0-9]/gi, "_")}_${ticket.ticket_code}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Ticket downloaded!");
  };

  const downloadQRCode = async (ticket) => {
    if (qrCodes[ticket.id]) {
      const link = document.createElement("a");
      link.download = `QR_${ticket.ticket_code}.png`;
      link.href = qrCodes[ticket.id];
      link.click();
      toast.success("QR Code downloaded!");
    } else {
      toast.error("QR Code not ready yet");
    }
  };

  const escapeHtml = (text) => {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const shareTicket = async (ticketCode) => {
    try {
      await navigator.share({
        title: "My Event Ticket",
        text: `Here's my ticket code: ${ticketCode}`,
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(ticketCode);
      toast.success("Ticket code copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-start">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r bg-clip-text">
              My Tickets
            </h1>
          </div>
          <p className="text-gray-500">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}{" "}
            found
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Tickets Yet
            </h2>
            <p className="text-gray-500 mb-6">
              You haven't booked any events. Start exploring!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
            {bookings.map((booking) => {
              const isExpanded = expandedBooking === booking.id;
              const eventDate = formatDate(booking.event_date);

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-md shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6 text-white">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Ticket className="w-5 h-5" />
                          <span className="text-sm font-medium opacity-90">
                            Booking Confirmed
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold">
                          {booking.event_title}
                        </h2>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-90">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            <span>{eventDate.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{eventDate.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-75">Booking Reference</p>
                        <p className="font-mono text-lg font-bold tracking-wider">
                          {booking.booking_code}
                        </p>
                        <div className="mt-2">
                          {booking.payment_status === "paid" && (
                            <span className="inline-flex items-center gap-1 text-xs bg-white/20 px-3 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Paid
                            </span>
                          )}
                          {booking.payment_status === "free" && (
                            <span className="inline-flex items-center gap-1 text-xs bg-white/20 px-3 py-1 rounded-full">
                              FREE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <MapPinned className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Venue
                          </p>
                          <p className="font-semibold text-gray-800">
                            {booking.event_venue || "To Be Announced"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Tickets
                          </p>
                          <p className="font-semibold text-gray-800">
                            {booking.ticket_count}{" "}
                            {booking.ticket_count === 1 ? "Ticket" : "Tickets"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Total Amount
                          </p>
                          <p className="font-semibold text-gray-800">
                            {parseFloat(booking.total_price) > 0
                              ? `$${parseFloat(booking.total_price).toFixed(2)}`
                              : "FREE"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <Receipt className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Booking Date
                          </p>
                          <p className="font-semibold text-gray-800">
                            {new Date(
                              booking.booking_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tickets Section with Real QR Codes */}
                    {booking.tickets && booking.tickets.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-800">
                              Your Tickets
                            </h3>
                          </div>
                          <button
                            onClick={() =>
                              setExpandedBooking(isExpanded ? null : booking.id)
                            }
                            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                          >
                            {isExpanded ? (
                              <>
                                Show Less <ChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                Show All <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>

                        <div
                          className={`grid gap-3 ${isExpanded ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
                        >
                          {(isExpanded
                            ? booking.tickets
                            : booking.tickets.slice(0, 2)
                          ).map((ticket, idx) => (
                            <div
                              key={ticket.id}
                              className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <Ticket className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                      <p className="font-mono text-sm font-bold text-orange-600">
                                        {ticket.ticket_code}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Ticket #{idx + 1} • {ticket.ticket_type}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      downloadTicket(ticket, booking)
                                    }
                                    className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                                    title="Download Ticket"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      shareTicket(ticket.ticket_code)
                                    }
                                    className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                                    title="Share Ticket"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => downloadQRCode(ticket)}
                                    className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                                    title="Download QR Code"
                                  >
                                    <QrCode className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Real QR Code Display */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                  {qrCodes[ticket.id] ? (
                                    <img
                                      src={qrCodes[ticket.id]}
                                      alt="QR Code"
                                      className="w-12 h-12 border border-gray-200 rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">
                                      Entry QR Code
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Scan at entrance for verification
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {!isExpanded && booking.tickets.length > 2 && (
                          <p className="text-center text-sm text-gray-500 mt-3">
                            +{booking.tickets.length - 2} more tickets. Click
                            "Show All" to view.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                      <Link
                        to={`/event/${booking.event_id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        View Event
                      </Link>
                      <button
                        onClick={() => {
                          const allTicketCodes = booking.tickets
                            .map((t) => t.ticket_code)
                            .join("\n");
                          navigator.clipboard.writeText(allTicketCodes);
                          toast.success("All ticket codes copied!");
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                      >
                        <Ticket className="w-4 h-4" />
                        Copy All Codes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
