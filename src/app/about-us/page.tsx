import React from 'react';
import Image from 'next/image';

import { Lightbulb, Shield, Users } from 'lucide-react';

import { ABOUT_US_IMAGES } from 'constants/storage';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Info from '@/components/about-us/Info';
import { getAboutUsByShippingLineId } from '@/services';

export type IconKey = 'Lightbulb' | 'Shield' | 'Users';

interface CoreValue {
  title: string;
  description: string;
  icon: IconKey;
  color: string;
  iconImage?: string;
}

const iconMap: Record<IconKey, React.ElementType> = {
  Lightbulb: Lightbulb,
  Shield: Shield,
  Users: Users
};

export default async function AboutPage() {
  const shippingLineId = parseInt(process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || '3');

  const aboutUs = await getAboutUsByShippingLineId(shippingLineId);
  let coreValues: CoreValue[] = [
    {
      title: 'Innovation',
      description: 'Constantly pushing boundaries in logistics technology',
      icon: 'Lightbulb',
      color: '#eab308',
      iconImage: undefined
    },
    {
      title: 'Reliability',
      description: 'Delivering consistent and dependable solutions',
      icon: 'Shield',
      color: '#22c55e',
      iconImage: undefined
    },
    {
      title: 'Customer-Centric',
      description: 'Focusing on the unique needs of our clients',
      icon: 'Users',
      color: '#4299e1',
      iconImage: undefined
    }
  ];

  if (aboutUs?.ourCoreValues) {
    const parsedCoreValues = JSON.parse(aboutUs.ourCoreValues || '[]');

    if (Array.isArray(parsedCoreValues) && parsedCoreValues.length > 0) {
      const finalCoreValues = parsedCoreValues.map((value, index) => {
        // For the first 3 values, if no iconImage is present, use the default icon.
        if (index < 3 && !value.iconImage) {
          return {
            ...coreValues[index], // Provides default icon and color
            ...value // Overwrites with admin-provided title and description
          };
        }
        return value;
      });
      coreValues = finalCoreValues;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-12">About Us</h1>

      <div className="mb-16 relative aspect-[2/1] w-full">
        <Image
          src={`${ABOUT_US_IMAGES}${aboutUs?.shippingLineId}/${aboutUs?.imageFilename}`}
          alt={aboutUs?.imageLabel || ''}
          fill
          priority
          className="rounded-lg shadow-2xl object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end justify-center pb-8">
          <h2 className="text-3xl font-semibold text-white">{aboutUs?.imageCaption}</h2>
        </div>
      </div>

      <Info aboutUs={aboutUs!} />

      <section className="mb-16 py-12 rounded-xl">
        <h2 className="text-3xl font-semibold mb-8 text-center text-primary">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8 px-4">
          {Array.isArray(coreValues) &&
            coreValues.map((value, index) => (
              <Card key={index} className="overflow-hidden group">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">
                    <div
                      className="flex justify-center items-center transition-transform"
                      style={{
                        color: value.color
                      }}
                    >
                      {value.iconImage ? (
                        <img
                          src={value.iconImage}
                          alt={value.title + ' icon'}
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: 'contain'
                          }}
                          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                        />
                      ) : (
                        iconMap[value.icon] &&
                        React.createElement(iconMap[value.icon], {
                          className: 'w-16 h-16',
                          style: {
                            stroke: value.color
                          }
                        })
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 text-center group-hover:text-blue-700 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-center text-gray-600 group-hover:text-gray-800 transition-colors">
                    {value.description}
                  </p>
                </CardContent>
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
              </Card>
            ))}
        </div>
      </section>

      {shippingLineId === 3 && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to revolutionize your logistics?</h2>
          <Link href="/contact-us" passHref>
            <Button variant="default" className="px-6 py-3">
              Get in touch
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
