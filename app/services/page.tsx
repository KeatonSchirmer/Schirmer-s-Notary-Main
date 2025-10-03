"use client";
import { useAuth } from "../auth-context";

export default function Services() {
    const { isPremium } = useAuth();

    const mobileBase = 10;
    const mobileTravel = 20;
    const mobileAddon = 10;
    const loanBase = 150;
    const loanTravel = 25;
    const loanRush = 25;
    const onlineBase = 30;
    const onlineAddon = 15;
    const onlineUrgent = 15;
    const onlineRush = 25;

    const discount = isPremium ? 0.4 : 0;
    const mobileBaseP = (mobileBase * (1 - discount)).toFixed(2);
    const mobileTravelP = (mobileTravel * (1 - discount)).toFixed(2);
    const mobileAddonP = (mobileAddon * (1 - discount)).toFixed(2);
    const loanBaseP = (loanBase * (1 - discount)).toFixed(2);
    const loanTravelP = (loanTravel * (1 - discount)).toFixed(2);
    const loanRushP = (loanRush * (1 - discount)).toFixed(2);
    const onlineBaseP = (onlineBase * (1 - discount)).toFixed(2);
    const onlineAddonP = (onlineAddon * (1 - discount)).toFixed(2);
    const onlineUrgentP = (onlineUrgent * (1 - discount)).toFixed(2);
    const onlineRushP = (onlineRush * (1 - discount)).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl font-bold pt-4 md:pt-5 mb-6 md:mb-8 text-center text-[#676767]">Our Services & Pricing</h2>
            {isPremium && (
                <div className="bg-gray-100 p-3 md:p-4 rounded-xl shadow mb-6 md:mb-8 max-w-4xl mx-auto text-center">
                    <h3 className="text-lg md:text-xl font-semibold text-[#676767] mb-1 md:mb-2">Premium Pricing Applied</h3>
                    <p className="text-[#676767] text-sm md:text-base">You save 40% on all notary service fees!</p>
                </div>
            )}

            <div className="bg-white p-4 md:p-8 rounded-xl shadow-md mb-8 md:mb-12 max-w-4xl mx-auto text-center">
                <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4 text-[#676767]">Schirmer&apos;s Notary Pricing Policy</h3>
                <p className="mb-2 md:mb-4 text-sm md:text-base">
                At Schirmer&apos;s Notary, we provide flexible service options to meet the needs of individuals and businesses.
                Our mission is to make notarization fast, reliable, and convenient — whether in person, online, or in-office.
                Our pricing reflects the time, travel, and preparation required for each service. All rates are transparent
                with no hidden fees, and we offer subscription discounts and retainers for clients with recurring needs.
                To ensure availability, rush and after-hours appointments may be subject to premium pricing.
                </p>
            </div>

            <div className="bg-gray-50 p-3 md:p-6 rounded-xl shadow mb-6 md:mb-8 max-w-4xl mx-auto">
                <h4 className="text-lg md:text-xl font-semibold text-[#676767] mb-2 md:mb-3">General Mobile Notarizations</h4>
                <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base">
                <li>${mobileBaseP} per document + ${mobileTravelP} travel fee within 15 miles</li>
                <li>$1.00 per mile after 15 miles</li>
                <li>Add-ons: ${mobileAddonP} per extra signer, seal, or document</li>
                </ul>
            </div>

            <div className="bg-gray-50 p-3 md:p-6 rounded-xl shadow mb-6 md:mb-8 max-w-4xl mx-auto">
                <h4 className="text-lg md:text-xl font-semibold text-[#676767] mb-2 md:mb-3">Loan Signings / Real Estate Closings</h4>
                <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base">
                <li>Flat rate: ${loanBaseP} per signing within 25 miles</li>
                <li>+${loanTravelP} travel surcharge beyond 25 miles</li>
                <li>Add-ons: ${loanRushP} for same-day rush jobs</li>
                </ul>
            </div>

            <div className="bg-gray-50 p-3 md:p-6 rounded-xl shadow mb-6 md:mb-8 max-w-4xl mx-auto">
                <h4 className="text-lg md:text-xl font-semibold text-[#676767] mb-2 md:mb-3">Remote Online Notarization</h4>
                <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base">
                <li>${onlineBaseP} per document</li>
                <li>${onlineAddonP} per extra signer or seal</li>
                <li>Urgent/after-hours fee: +${onlineUrgentP}</li>
                <li>Rush fee: +${onlineRushP}</li>
                </ul>
            </div>

            <div className="bg-gray-50 p-3 md:p-6 rounded-xl shadow mb-6 md:mb-8 max-w-4xl mx-auto">
                <h4 className="text-lg md:text-xl font-semibold text-[#676767] mb-2 md:mb-3">Business Subscriptions</h4>
                <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base">
                <li><strong>Business Plan:</strong> $30/month - Save 20% on all notary service fees</li>
                <li><strong>Premium Plan:</strong> $75/month - Save 40% on all notary service fees & Priority Booking</li>
                <li><strong>Corporate Retainer:</strong> $750/month - Ask for more information</li>
                </ul>
                <p className="mt-2 md:mt-3 text-xs md:text-sm italic">*Minimum subscription commitment: 6 months</p>
            </div>

            <div className="bg-gray-50 p-3 md:p-6 rounded-xl shadow max-w-4xl mx-auto pb-10 md:pb-16">
                <h4 className="text-lg md:text-xl font-semibold text-[#676767] mb-2 md:mb-3">Contract Pricing</h4>
                <p className="text-sm md:text-base">
                We also provide custom contract pricing for larger companies and organizations that require long-term or
                high-volume notary services. Please <a href="/contact" className="text-[#676767] hover:underline">contact us</a> directly 
                to discuss a tailored plan.
                </p>
            </div>
        </div>
    );
}