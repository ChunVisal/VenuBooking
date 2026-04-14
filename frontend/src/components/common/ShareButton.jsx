import { useState } from "react";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Check,
  X,
  User,
} from "lucide-react";

const ShareButton = ({ type, id, title, image }) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Build URL based on type
  const getShareUrl = () => {
    if (type === "event") {
      return `${window.location.origin}/event/${id}`;
    } else if (type === "profile") {
      return `${window.location.origin}/profile/${id}`;
    }
    return `${window.location.origin}`;
  };

  const getShareText = () => {
    if (type === "event") {
      return `Check out this event: ${title || "Amazing Event"}!`;
    } else if (type === "profile") {
      return `Check out ${title || "this user"}'s profile on VenuBooking!`;
    }
    return "Check this out on VenuBooking!";
  };

  const shareUrl = getShareUrl();
  const shareText = getShareText();

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} - ${shareUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
    setTimeout(() => setShowModal(false), 500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowModal(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: type === "event" ? title : `${title}'s Profile`,
          text: shareText,
          url: shareUrl,
        });
        setShowModal(false);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleNativeShare}
        className="p-2 text-gray-600 hover:text-orange-500 transition-colors rounded-full hover:bg-gray-100"
        aria-label="Share"
      >
        <Share2 size={18} />
      </button>

      {/* Share Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Share {type === "event" ? "Event" : "Profile"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {shareText}
            </p>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-4"
            >
              <div className="flex items-center gap-3">
                <Link2 size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Copy Link
                </span>
              </div>
              {copied ? (
                <Check size={18} className="text-green-500" />
              ) : (
                <span className="text-xs text-gray-400 truncate max-w-[150px]">
                  {shareUrl}
                </span>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare("facebook")}
                className="flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] text-white rounded-xl hover:bg-[#1877F2]/90 transition-colors"
              >
                <Facebook size={18} />
                <span className="text-sm font-medium">Facebook</span>
              </button>

              <button
                onClick={() => handleShare("twitter")}
                className="flex items-center justify-center gap-2 py-2.5 bg-[#1DA1F2] text-white rounded-xl hover:bg-[#1DA1F2]/90 transition-colors"
              >
                <Twitter size={18} />
                <span className="text-sm font-medium">Twitter</span>
              </button>

              <button
                onClick={() => handleShare("linkedin")}
                className="flex items-center justify-center gap-2 py-2.5 bg-[#0077B5] text-white rounded-xl hover:bg-[#0077B5]/90 transition-colors"
              >
                <Linkedin size={18} />
                <span className="text-sm font-medium">LinkedIn</span>
              </button>

              <button
                onClick={() => handleShare("whatsapp")}
                className="flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl hover:bg-[#25D366]/90 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.032 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.8.5 3.5 1.4 5L2.5 21.5l4.8-1.4c1.5.9 3.2 1.4 5 1.4 5.25 0 9.5-4.25 9.5-9.5s-4.25-9.5-9.5-9.5zm0 17.5c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.8.8.8-2.8-.2-.3c-.8-1.3-1.2-2.8-1.2-4.3 0-4.3 3.5-7.8 7.8-7.8 4.3 0 7.8 3.5 7.8 7.8 0 4.3-3.5 7.8-7.8 7.8zm4-5.9c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.1.2-.5.7-.6.8-.1.1-.2.1-.4 0-.2-.1-.8-.3-1.5-.9-.6-.5-1-1.1-1.1-1.3-.1-.1 0-.2.1-.3.1-.1.2-.3.3-.4.1-.1.1-.2.1-.3 0-.1-.1-.3-.2-.4-.1-.1-.5-1.2-.7-1.6-.2-.4-.3-.4-.4-.4h-.4c-.1 0-.3.1-.5.2-.2.1-.7.7-.7 1.7 0 1 .7 2 1.1 2.3.4.3 2.5 1.9 3.5 2.2.5.2 1 .2 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z" />
                </svg>
                <span className="text-sm font-medium">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare("telegram")}
                className="flex items-center justify-center gap-2 py-2.5 bg-[#0088cc] text-white rounded-xl hover:bg-[#0088cc]/90 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.032 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.8.5 3.5 1.4 5L2.5 21.5l4.8-1.4c1.5.9 3.2 1.4 5 1.4 5.25 0 9.5-4.25 9.5-9.5s-4.25-9.5-9.5-9.5zM9.5 15.8l-1.8-1.8 5.5-5.5 1.8 1.8-5.5 5.5zm6.5-6.5l-1.8-1.8 1.5-1.5 1.8 1.8-1.5 1.5z" />
                </svg>
                <span className="text-sm font-medium">Telegram</span>
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Share this {type === "event" ? "event" : "profile"} with your
              friends
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
