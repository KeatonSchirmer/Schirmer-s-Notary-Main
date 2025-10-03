"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../auth-context";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const { isLoggedIn, userId, logout } = useAuth();
  const [notifications, setNotifications] = useState(false);
  // Removed unused modal states for future implementation
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAEmailSent, setShow2FAEmailSent] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [accountInfo, setAccountInfo] = useState({
    name: "",
    email: "",
    address: "",
    password: "********",
  });
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editAccount, setEditAccount] = useState(accountInfo);
  
  const [billingInfo, setBillingInfo] = useState({
    billing_address: "",
    card_holder_name: "",
    card_number_masked: "",
    card_expiry: "",
    card_type: "",
  });
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [showDeleteCardConfirm, setShowDeleteCardConfirm] = useState(false);
  const [editBilling, setEditBilling] = useState({
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "US",
    card_holder_name: "",
    card_number: "",
    card_expiry: "",
    cvv: "",
  });

  // Removed unused maskCardNumber function - functionality handled elsewhere

  const getCardType = (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.match(/^4/)) return 'Visa';
    if (cleaned.match(/^5[1-5]/)) return 'Mastercard';
    if (cleaned.match(/^3[47]/)) return 'American Express';
    if (cleaned.match(/^6/)) return 'Discover';
    return 'Unknown';
  };

  const formatCardNumber = (input: string): string => {
    const cleaned = input.replace(/\s/g, '');
    const limited = cleaned.slice(0, 16);
    return limited.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (input: string): string => {
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    async function fetchAccountInfo() {
      try {
        const response = await fetch("https://schirmer-s-notary-backend.onrender.com/auth/profile", {
          method: "GET",
          headers: { 'X-User-Id': String(userId) },
          credentials: "include"
        });
        
        if (response.ok) {
          const res = await response.json();
          const info = {
            name: res.name || "",
            email: res.email || "",
            address: res.address || "",
            password: "********",
          };
          setAccountInfo(info);
          setEditAccount(info);
        }
      } catch {
        console.error("Failed to fetch account info");
      }
    }
    
    if (userId) {
      fetchAccountInfo();
    }
  }, [userId]);

  useEffect(() => {
    async function fetch2FAStatus() {
      try {
        const response = await fetch("https://schirmer-s-notary-backend.onrender.com/auth/twofa/status", {
          method: "GET",
          headers: { 'X-User-Id': String(userId) },
          credentials: "include"
        });
        
        if (response.ok) {
          const res = await response.json();
          setTwoFactorEnabled(res.twofa_verified === true);
        }
      } catch {
        setTwoFactorEnabled(false);
      }
    }
    
    if (userId) {
      fetch2FAStatus();
    }
  }, [userId]);

  useEffect(() => {
    async function fetchBillingInfo() {
      try {
        const response = await fetch("https://schirmer-s-notary-backend.onrender.com/auth/billing/info", {
          method: "GET",
          headers: { 'X-User-Id': String(userId) },
          credentials: "include"
        });
        
        if (response.ok) {
          const res = await response.json();
          setBillingInfo({
            billing_address: `${res.address || ""} ${res.city || ""} ${res.state || ""} ${res.zip_code || ""}`.trim(),
            card_holder_name: res.payment_method || "",
            card_number_masked: res.card_number ? res.card_number.slice(-4) : "",
            card_expiry: res.card_expir || "",
            card_type: res.card_number ? getCardType(res.card_number) : "",
          });
        }
      } catch {
        console.error("Failed to fetch billing info");
      }
    }
    
    if (userId) {
      fetchBillingInfo();
    }
  }, [userId]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSaveAccount = async () => {
    try {
      const response = await fetch("https://schirmer-s-notary-backend.onrender.com/auth/profile/update", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          'X-User-Id': String(userId) 
        },
        credentials: "include",
        body: JSON.stringify({
          name: editAccount.name,
          email: editAccount.email,
          address: editAccount.address,
        })
      });

      if (response.ok) {
        setAccountInfo(editAccount);
        setIsEditingAccount(false);
        alert("Account info updated successfully.");
      } else {
        throw new Error("Failed to update account");
      }
    } catch {
      alert("Failed to update account info.");
    }
  };

  const handleRequest2FA = async () => {
    try {
      const response = await fetch('https://schirmer-s-notary-backend.onrender.com/auth/twofa/request', {
        method: 'POST',
        headers: { 'X-User-Id': String(userId) },
        credentials: "include"
      });

      if (response.ok) {
        setShow2FAEmailSent(true);
        alert("Confirmation email sent! Check your email for a code to enable 2FA.");
      } else {
        throw new Error("Failed to send email");
      }
    } catch {
      alert("Failed to send confirmation email.");
    }
  };

  const handleConfirm2FA = async () => {
    try {
      const response = await fetch('https://schirmer-s-notary-backend.onrender.com/auth/twofa/confirm', {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json",
          'X-User-Id': String(userId) 
        },
        credentials: "include",
        body: JSON.stringify({ code: confirmationCode })
      });

      if (response.ok) {
        setTwoFactorEnabled(true);
        setShow2FAModal(false);
        setShow2FAEmailSent(false);
        setConfirmationCode("");
        alert("Two-Factor Authentication enabled successfully.");
      } else {
        throw new Error("Invalid code");
      }
    } catch {
      alert("Invalid or expired code.");
    }
  };

  const handleSaveBilling = async () => {
    try {
      const response = await fetch("https://schirmer-s-notary-backend.onrender.com/auth/billing/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'X-User-Id': String(userId) 
        },
        credentials: "include",
        body: JSON.stringify({
          address: editBilling.address,
          city: editBilling.city,
          state: editBilling.state,
          zip_code: editBilling.zip_code,
          country: editBilling.country,
          payment_method: editBilling.card_holder_name,
          card_number: editBilling.card_number.replace(/\s/g, ''),
          card_expir: editBilling.card_expiry,
          card_cvv: editBilling.cvv
        })
      });

      if (response.ok) {
        const fullAddress = `${editBilling.address}, ${editBilling.city}, ${editBilling.state} ${editBilling.zip_code}`.trim();
        setBillingInfo({
          billing_address: fullAddress,
          card_holder_name: editBilling.card_holder_name,
          card_number_masked: editBilling.card_number.slice(-4),
          card_expiry: editBilling.card_expiry,
          card_type: getCardType(editBilling.card_number),
        });

        setEditBilling({
          ...editBilling,
          card_number: "",
          cvv: "",
        });

        setIsEditingBilling(false);
        alert("Payment method updated successfully.");
      } else {
        throw new Error("Failed to update billing");
      }
    } catch (error) {
      alert("Failed to update payment method.");
    }
  };

  const handleDeleteCard = async () => {
    try {
      const response = await fetch("https://schirmer-s-notary-backend.onrender.com/auth/billing/delete", {
        method: "DELETE",
        headers: { 'X-User-Id': String(userId) },
        credentials: "include"
      });

      if (response.ok) {
        setBillingInfo({
          billing_address: "",
          card_holder_name: "",
          card_number_masked: "",
          card_expiry: "",
          card_type: "",
        });

        setEditBilling({
          address: "",
          city: "",
          state: "",
          zip_code: "",
          country: "US",
          card_holder_name: "",
          card_number: "",
          card_expiry: "",
          cvv: "",
        });

        setShowDeleteCardConfirm(false);
        alert("Payment method deleted successfully.");
      } else {
        throw new Error("Failed to delete card");
      }
    } catch (error) {
      alert("Failed to delete payment method.");
    }
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotifications(value);
    localStorage.setItem('notifications_enabled', value ? 'true' : 'false');
    
    if (value) {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission !== 'granted') {
              setNotifications(false);
              localStorage.setItem('notifications_enabled', 'false');
              alert("Please enable notifications in your browser settings.");
            } else {
              alert("Push notifications enabled.");
            }
          });
        } else if (Notification.permission === 'denied') {
          setNotifications(false);
          localStorage.setItem('notifications_enabled', 'false');
          alert("Notifications are blocked. Please enable them in your browser settings.");
        } else {
          alert("Push notifications enabled.");
        }
      }
    } else {
      alert("Notifications disabled.");
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Implement account deletion
      fetch('https://schirmer-s-notary-backend.onrender.com/auth/profile/delete', {
        method: 'DELETE',
        headers: { 'X-User-Id': String(userId) },
        credentials: "include"
      })
      .then(response => {
        if (response.ok) {
          alert("Account deleted successfully.");
          logout();
          router.push('/');
        } else {
          throw new Error("Failed to delete account");
        }
      })
      .catch(() => {
        alert("Failed to delete account.");
      });
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile</h2>
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-[#676767] rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {accountInfo.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{accountInfo.name || 'User'}</h3>
              <p className="text-gray-600">{accountInfo.email}</p>
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Account Information</h2>
            <button
              onClick={() => {
                if (isEditingAccount) {
                  handleSaveAccount();
                } else {
                  setIsEditingAccount(true);
                  setEditAccount({
                    name: accountInfo.name,
                    email: accountInfo.email,
                    address: accountInfo.address,
                    password: accountInfo.password,
                  });
                }
              }}
              className="bg-[#676767] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#575757] transition-colors flex items-center gap-2"
            >
              {isEditingAccount ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </>
              )}
            </button>
          </div>
          
          {isEditingAccount ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={editAccount.name}
                  onChange={(e) => setEditAccount({ ...editAccount, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={editAccount.email}
                  onChange={(e) => setEditAccount({ ...editAccount, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">Address</label>
                <input
                  type="text"
                  value={editAccount.address}
                  onChange={(e) => setEditAccount({ ...editAccount, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                  placeholder="Your address"
                />
              </div>

              <button
                onClick={() => {
                  setIsEditingAccount(false);
                  setEditAccount({
                    name: accountInfo.name,
                    email: accountInfo.email,
                    address: accountInfo.address,
                    password: accountInfo.password,
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="text-gray-800 font-medium">{accountInfo.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-gray-800 font-medium">{accountInfo.email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Address</p>
                <p className="text-gray-800 font-medium">{accountInfo.address || 'Not set'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Billing Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Billing Information</h2>
            <div className="flex gap-2">
              {billingInfo.card_number_masked && (
                <button
                  onClick={() => setShowDeleteCardConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              )}
              <button
                onClick={() => {
                  if (isEditingBilling) {
                    handleSaveBilling();
                  } else {
                    setIsEditingBilling(true);
                    if (!billingInfo.card_number_masked) {
                      const addressParts = (billingInfo.billing_address || "").split(',').map(part => part.trim());
                      const address = addressParts[0] || "";
                      const city = addressParts[1] || "";
                      const stateZip = addressParts[2] || "";
                      const [state, zip_code] = stateZip.split(' ').filter((part: string) => part.length > 0);
                      
                      setEditBilling({
                        address: address,
                        city: city,
                        state: state || "",
                        country: "US",
                        zip_code: zip_code || "",
                        card_holder_name: billingInfo.card_holder_name || "",
                        card_number: "",
                        card_expiry: billingInfo.card_expiry || "",
                        cvv: "",
                      });
                    }
                  }
                }}
                className="bg-[#676767] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#575757] transition-colors flex items-center gap-2"
              >
                {isEditingBilling ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Save
                  </>
                ) : (
                  <>
                    {billingInfo.card_number_masked ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Payment Method
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
          
          {isEditingBilling ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={editBilling.card_holder_name}
                  onChange={(e) => setEditBilling({ ...editBilling, card_holder_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                  placeholder="Name on card"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">Card Number</label>
                <input
                  type="text"
                  value={editBilling.card_number}
                  onChange={(e) => setEditBilling({ ...editBilling, card_number: formatCardNumber(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={editBilling.card_expiry}
                    onChange={(e) => setEditBilling({ ...editBilling, card_expiry: formatExpiryDate(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">CVV</label>
                  <input
                    type="password"
                    value={editBilling.cvv}
                    onChange={(e) => setEditBilling({ ...editBilling, cvv: e.target.value.replace(/\D/g, '') })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">Street Address</label>
                <input
                  type="text"
                  value={editBilling.address}
                  onChange={(e) => setEditBilling({ ...editBilling, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">City</label>
                <input
                  type="text"
                  value={editBilling.city}
                  onChange={(e) => setEditBilling({ ...editBilling, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                  placeholder="City"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">State</label>
                  <input
                    type="text"
                    value={editBilling.state}
                    onChange={(e) => setEditBilling({ ...editBilling, state: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={editBilling.zip_code}
                    onChange={(e) => setEditBilling({ ...editBilling, zip_code: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="12345"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setIsEditingBilling(false);
                  const addressParts = (billingInfo.billing_address || "").split(',').map(part => part.trim());
                  const address = addressParts[0] || "";
                  const city = addressParts[1] || "";
                  const stateZip = addressParts[2] || "";
                  const [state, zip_code] = stateZip.split(' ').filter((part: string) => part.length > 0);
                  
                  setEditBilling({
                    address: address,
                    city: city,
                    state: state || "",
                    zip_code: zip_code || "",
                    country: "US",
                    card_holder_name: billingInfo.card_holder_name || "",
                    card_number: "",
                    card_expiry: billingInfo.card_expiry || "",
                    cvv: "",
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {billingInfo.card_number_masked ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Cardholder Name</p>
                    <p className="text-gray-800 font-medium">{billingInfo.card_holder_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Card</p>
                    <p className="text-gray-800 font-medium">
                      {billingInfo.card_type} •••• {billingInfo.card_number_masked}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Expires</p>
                    <p className="text-gray-800 font-medium">{billingInfo.card_expiry}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Billing Address</p>
                    <p className="text-gray-800 font-medium">{billingInfo.billing_address || 'Not set'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No payment method on file</p>
              )}
            </>
          )}
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h2>
          
          {/* 2FA */}
          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <div>
              <h3 className="text-gray-800 font-medium">Two-Factor Authentication</h3>
              <p className="text-gray-600 text-sm">Extra security for your account</p>
            </div>
            {twoFactorEnabled ? (
              <span className="text-green-600 font-semibold">Enabled</span>
            ) : (
              <button
                onClick={() => setShow2FAModal(true)}
                className="bg-[#676767] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#575757] transition-colors"
              >
                Enable
              </button>
            )}
          </div>
          
          {/* Notifications */}
          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <div>
              <h3 className="text-gray-800 font-medium">Push Notifications</h3>
              <p className="text-gray-600 text-sm">Receive notifications for new bookings</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#676767]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#676767]"></div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
          
          <button
            onClick={handleDeleteAccount}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Delete Account
          </button>
        </div>

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Two-Factor Authentication</h2>
              <p className="text-gray-600 mb-4">Enable extra security for your account.</p>
              
              {!twoFactorEnabled && !show2FAEmailSent && (
                <button 
                  onClick={handleRequest2FA}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mb-4"
                >
                  Send Confirmation Email
                </button>
              )}
              
              {show2FAEmailSent && !twoFactorEnabled && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="Enter confirmation code"
                  />
                  <button 
                    onClick={handleConfirm2FA}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Confirm 2FA Setup
                  </button>
                </div>
              )}
              
              {twoFactorEnabled && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-green-800 text-center font-semibold">Two-Factor Authentication is enabled</p>
                </div>
              )}
              
              <button 
                onClick={() => {
                  setShow2FAModal(false);
                  setShow2FAEmailSent(false);
                  setConfirmationCode("");
                }}
                className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Delete Card Confirmation Modal */}
        {showDeleteCardConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Payment Method</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete your payment method? This action cannot be undone.
              </p>
              <p className="text-gray-600 mb-6 italic">
                Card ending in: {billingInfo.card_number_masked}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleDeleteCard}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Payment Method
                </button>
                <button 
                  onClick={() => setShowDeleteCardConfirm(false)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
