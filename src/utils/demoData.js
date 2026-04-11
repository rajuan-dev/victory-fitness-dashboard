export const globalDemoData = {
  users: [
    {
      id: "1", fullName: "Alex Thompson", email: "alex.t@example.com",
      role: "Admin", contactNumber: "+1-555-123-4567", country: "United States",
      status: "ACTIVE", createdAt: "2024-03-20T10:00:00Z", profileImage: "https://i.pravatar.cc/150?u=1"
    },
    {
      id: "2", fullName: "Sarah Jenkins", email: "s.jenkins@example.com",
      role: "User", contactNumber: "+44-20-7123-4567", country: "United Kingdom",
      status: "ACTIVE", createdAt: "2024-03-19T14:30:00Z", profileImage: "https://i.pravatar.cc/150?u=2"
    },
    {
      id: "3", fullName: "Michael Chen", email: "m.chen@example.com",
      role: "User", contactNumber: "+61-2-1234-5678", country: "Australia",
      status: "INACTIVE", createdAt: "2024-03-18T09:15:00Z", profileImage: "https://i.pravatar.cc/150?u=3"
    },
    {
      id: "4", fullName: "Emma Wilson", email: "emma.w@example.com",
      role: "Moderator", contactNumber: "+1-555-987-6543", country: "Canada",
      status: "ACTIVE", createdAt: "2024-03-17T16:45:00Z", profileImage: "https://i.pravatar.cc/150?u=4"
    },
    {
      id: "5", fullName: "David Rodriguez", email: "d.rodriguez@example.com",
      role: "User", contactNumber: "+34-91-123-45-67", country: "Spain",
      status: "ACTIVE", createdAt: "2024-03-16T11:20:00Z", profileImage: "https://i.pravatar.cc/150?u=5"
    }
  ],
  faqs: [
    { id: "1", question: "How do I reset my password?", answer: "To reset your password, click on the 'Forgot Password' link on the login page and follow the instructions sent to your email." },
    { id: "2", question: "How can I update my billing information?", answer: "You can update your billing information by navigating to the 'Billing' section in your account settings." },
    { id: "3", question: "What is the refund policy?", answer: "We offer a 30-day money-back guarantee. If you are not satisfied with our service, please contact support for a full refund." }
  ],
  notifications: [
    { id: "1", title: "System Update", message: "We have updated the dashboard to improve performance.", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() }, // 1 hour ago
    { id: "2", title: "New User Registered", message: "A new user, Sarah Jenkins, has just signed up.", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() }, // 2 hours ago
    { id: "3", title: "Payment Failed", message: "Your recent payment for the Pro plan has failed. Please update your billing info.", read: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() } // 2 days ago
  ],
  privacyPolicy: `
    <h2>Privacy Policy</h2>
    <p>Last updated: April 11, 2026</p>
    <p>We respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit the website.</p>
    <h3>Information We Collect</h3>
    <p>We collect several types of information from and about users of our Website, including information:</p>
    <ul>
      <li>By which you may be personally identified, such as name, postal address, e-mail address, telephone number, or any other identifier by which you may be contacted online or offline ("personal information").</li>
      <li>That is about you but individually does not identify you.</li>
      <li>About your internet connection, the equipment you use to access our Website, and usage details.</li>
    </ul>
    <h3>How We Use Your Information</h3>
    <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
    <ul>
      <li>To present our Website and its contents to you.</li>
      <li>To provide you with information, products, or services that you request from us.</li>
      <li>To fulfill any other purpose for which you provide it.</li>
    </ul>
  `,
  aboutUs: `
    <h2>About Us</h2>
    <p>Welcome to Victor Admin!</p>
    <p>We are dedicated to providing the best fitness tracking and management experience. Our platform is designed to help you achieve your goals with ease and efficiency.</p>
    <h3>Our Mission</h3>
    <p>To empower individuals to take control of their health and fitness journey through innovative technology and community support.</p>
  `,
  termsCondition: `
    <h2>Terms and Conditions</h2>
    <p>Last updated: April 11, 2026</p>
    <p>Please read these terms and conditions carefully before using Our Service.</p>
    <h3>Interpretation and Definitions</h3>
    <h4>Interpretation</h4>
    <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
    <h4>Definitions</h4>
    <p>For the purposes of these Terms and Conditions:</p>
    <ul>
      <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
      <li><strong>Country</strong> refers to: United Kingdom</li>
      <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Victor Admin.</li>
    </ul>
  `,
  profileData: {
    fullName: "Victor Admin",
    email: "admin@victor.com",
    contactNumber: "+1-800-123-4567",
    address: "123 Admin Blvd, Tech City, TC 10010",
    profileImage: "https://i.pravatar.cc/150?img=11"
  },
  workouts: [
    {
      id: "1",
      title: "Full Body Dumbbell Workout",
      vimeoId: "740239410",
      tag: "Strength",
      visibility: "Published",
      thumbnail: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=300&auto=format&fit=crop",
      dateAdded: "2024-03-20T10:00:00Z"
    },
    {
      id: "2",
      title: "HIIT Cardio Blast",
      vimeoId: "847239103",
      tag: "Cardio",
      visibility: "Published",
      thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=300&auto=format&fit=crop",
      dateAdded: "2024-04-10T14:30:00Z"
    },
    {
      id: "3",
      title: "Core Stability Routine",
      vimeoId: "931023412",
      tag: "Core",
      visibility: "Draft",
      thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop",
      dateAdded: "2024-04-12T09:15:00Z"
    },
    {
      id: "4",
      title: "Lower Body Power",
      vimeoId: "593847219",
      tag: "Strength",
      visibility: "Published",
      thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop",
      dateAdded: "2024-04-05T16:45:00Z"
    },
    {
      id: "5",
      title: "Yoga Flow for Flexibility",
      vimeoId: "102938475",
      tag: "Yoga",
      visibility: "Published",
      thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300&auto=format&fit=crop",
      dateAdded: "2024-04-01T11:20:00Z"
    },
    {
      id: "6",
      title: "Advanced Pull-Up Progression",
      vimeoId: "482710394",
      tag: "Calisthenics",
      visibility: "Draft",
      thumbnail: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=300&auto=format&fit=crop",
      dateAdded: "2024-03-25T08:30:00Z"
    }
  ],
  subscribers: [
    {
      id: "1", fullName: "Alex Thompson", email: "alex.t@example.com",
      subscriptionTier: "SILVER", contactNumber: "+1-555-123-4567", country: "United States",
      status: "ACTIVE", joinedDate: "2024-03-20T10:00:00Z", profileImage: "https://i.pravatar.cc/150?u=1"
    },
    {
      id: "2", fullName: "Sarah Jenkins", email: "s.jenkins@example.com",
      subscriptionTier: "GOLD", contactNumber: "+44-20-7123-4567", country: "United Kingdom",
      status: "ACTIVE", joinedDate: "2024-03-19T14:30:00Z", profileImage: "https://i.pravatar.cc/150?u=2"
    },
    {
      id: "3", fullName: "Michael Chen", email: "m.chen@example.com",
      subscriptionTier: "PLATINUM", contactNumber: "+61-2-1234-5678", country: "Australia",
      status: "EXPIRED", joinedDate: "2024-02-18T09:15:00Z", profileImage: "https://i.pravatar.cc/150?u=3"
    },
    {
      id: "4", fullName: "Michael Chen", email: "m.chen@example.com",
      subscriptionTier: "INNER CIRCLE", contactNumber: "+61-2-1234-5678", country: "Australia",
      status: "EXPIRED", joinedDate: "2024-02-18T09:15:00Z", profileImage: "https://i.pravatar.cc/150?u=3"
    }
  ],
  subscriptions: [
    {
      id: "1",
      tier: "VICTORY SILVER",
      description: "Good start, but not enough for full transformation.",
      priceMonthly: 19,
      priceYearly: 199,
      isApplicationOnly: false,
      isMostPopular: false,
      iconType: "silver_medal",
      features: [
        "Full Workout Library (120+)",
        "Basic Programs",
        "Limited Challenges"
      ]
    },
    {
      id: "2",
      tier: "VICTORY GOLD",
      description: "This is where real consistency starts. Structure & accountability.",
      priceMonthly: 29,
      priceYearly: 299,
      isApplicationOnly: false,
      isMostPopular: true,
      iconType: "gold_medal",
      features: [
        "All Silver features",
        "Accountability System (Tracking, Reminders)",
        "Community Challenges & Nutrition",
        "Basic wearable data (sleep & activity)"
      ]
    },
    {
      id: "3",
      tier: "VICTORY PLATINUM",
      description: "For those who want more precision and faster results.",
      priceMonthly: 39,
      priceYearly: 399,
      isApplicationOnly: false,
      isMostPopular: false,
      iconType: "diamond",
      features: [
        "All Gold features",
        "Personalized Plans",
        "Feedback System & Priority Support",
        "Full wearable syncing & AI adjustments"
      ]
    },
    {
      id: "4",
      tier: "VICTORY INNER CIRCLE",
      description: "For those who are ready to commit. Direct coaching with Victor.",
      priceMonthly: null,
      priceYearly: null,
      isApplicationOnly: true,
      isMostPopular: false,
      iconType: "circle",
      features: [
        "Direct Coaching with Victor",
        "Personal Structure & Plan",
        "Accountability Check-Ins & Adjustments",
        "Advanced AI health insights & trends"
      ]
    }
  ],
  challenges: [
    {
      id: "1",
      title: "30-Day Shred",
      duration: "30 Days",
      difficulty: "Intermediate",
      status: "Active",
      thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: "2",
      title: "Couch to 5K",
      duration: "8 Weeks",
      difficulty: "Beginner",
      status: "Active",
      thumbnail: "https://images.unsplash.com/photo-1552674605-171ff7ea3834?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: "3",
      title: "Summer Body Challenge",
      duration: "12 Weeks",
      difficulty: "Advanced",
      status: "Upcoming",
      thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: "4",
      title: "Yoga Core Reset",
      duration: "14 Days",
      difficulty: "Beginner",
      status: "Draft",
      thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: "5",
      title: "No-Equipment Cardio",
      duration: "21 Days",
      difficulty: "Intermediate",
      status: "Active",
      thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=300&auto=format&fit=crop"
    }
  ],
  masterclasses: []
};
