'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FaArrowRight } from 'react-icons/fa';
import { useState } from 'react';

export default function ContactUsForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative bg-white p-8 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Your Name *"
            required
          />
        </div>

        <div>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Your Email *"
            required
          />
        </div>

        <div>
          <Textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter Your Message *"
            required
            rows={4}
          ></Textarea>
        </div>

        <Button variant="default" type="submit">
          Send Us <FaArrowRight />
        </Button>
      </form>
    </div>
  );
}
