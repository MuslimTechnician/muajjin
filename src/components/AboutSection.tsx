
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

export function AboutSection() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>About Muajjin</CardTitle>
        <CardDescription>Information and usage instructions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Muajjin is your comprehensive Islamic prayer times application that provides accurate prayer times,
          Hijri calendar information, and Ramadan timings.
        </p>
        
        <Separator className="my-2" />
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="prayer-times">
            <AccordionTrigger>Prayer Times</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">The main screen displays the daily prayer times based on your location and calculation method settings.</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Prayer times are calculated based on your location and preferred calculation method</li>
                <li>Jama'ah times can be customized in the settings</li>
                <li>Time adjustments for Sehri and Iftar can be set in the prayer times tab</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="location">
            <AccordionTrigger>Location Settings</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">You can set your location in two ways:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Manual coordinates: Enter latitude and longitude directly</li>
                <li>City and country: Select your city and country from the dropdown</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="calculation-methods">
            <AccordionTrigger>Calculation Methods</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">Different regions follow different calculation methods:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Select the calculation method that is followed in your region</li>
                <li>Choose the appropriate Madhab for Asr prayer time calculation</li>
                <li>Adjust the Hijri date if needed to match local moon sighting</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="jamaah-times">
            <AccordionTrigger>Jama'ah Times</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">Set the congregation prayer times for your local mosque:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Enter the exact time for each prayer's congregation</li>
                <li>These times will be displayed alongside the calculated prayer times</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="offline-usage">
            <AccordionTrigger>Offline Usage</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">Muajjin works offline after your first visit:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Prayer times are cached for offline use</li>
                <li>Use the refresh option in settings to update the data</li>
                <li>Regular usage doesn't require an internet connection</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="data-refresh">
            <AccordionTrigger>Data Refresh</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">You can refresh the app data in two ways:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Soft refresh: Updates data without clearing cache</li>
                <li>Hard refresh: Clears all cached data and fetches fresh data from the server</li>
                <li>Use hard refresh if you notice any inconsistencies in prayer times</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
