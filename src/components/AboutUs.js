import React from 'react';
import './AboutUs.css'; // Make sure you have AboutUs.css for styling

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <section className="about-us-section card">
        <h2>🌱 About Us</h2>
        <p>
          At SmartFarm Solutions, we are driven by the vision of transforming agriculture in arid and semi-arid regions through innovation and technology. Born out of necessity and guided by a deep understanding of local farming challenges, our mission is to empower farmers with sustainable, data-driven irrigation systems that optimize water use and increase crop yield.
        </p>
        <p>
          Our IoT-based platform uses real-time sensor data — including soil moisture, temperature, and humidity — to intelligently manage irrigation systems. With features like automated pump control, visualized farm sensor history, and remote monitoring, we help farmers make informed decisions, conserve water, and boost productivity.
        </p>
        <p>
          Developed by a passionate team led by John Garang, a refugee innovator committed to food security and resilience, SmartFarm Solutions stands as a testament to what is possible when technology meets purpose.
        </p>
        <p>
          Together, we believe in farming smarter, not harder — and ensuring that even the driest lands can thrive.
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
