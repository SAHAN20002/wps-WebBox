'use client'


import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModel from './MeetingModel'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from './ui/textarea'
import ReactDatePicker from 'react-datepicker';
import { Input } from './ui/input'


const MeetingTypeList = () => {
    const router = useRouter();
    const [meetingState, setMeetingState] = useState <'isScheduleMeeting' | 'isJoininMeeting' | 'isInstantMeeting' | undefined>();
    const{user} = useUser();
    const client = useStreamVideoClient();
    const [values , setValues] = useState({
      dateTime:new Date(),
      description:'',
      link:''
    });
    const[calldetails,setCalldeatils] = useState<Call>()
    const { toast } = useToast()

    const creatMeeting = async() =>{

       if(!client || !user) return;

       try{
         if(!values.dateTime){
          toast({
            title: "Please  select a date and time"
            
          })
          return;
         }

         const id = crypto.randomUUID();
         const call = client.call('default' ,id);

         if(!call) throw new Error('Failed to create call')

          const startAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
          const description = values.description || 'Instant meetings';

          await call.getOrCreate({
            data: {
              starts_at:startAt,
              custom:{
                description
              }
            }
          })

          setCalldeatils(call);

          if(!values.description){
            router.push(`/meeting/${call.id}`)
          }

          toast({
            title: "Meeting Created"
           
          })

       }catch(error) {
         console.log(error);
         toast({
          title: "Failed to create meeting"
         
        })
       }

    }
    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${calldetails?.id}`


  return (
   <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
   <HomeCard
     img="/icons/add-meeting.svg"
     title="New Meeting"
     description="Start an instant meeting"
     handleClick={() => setMeetingState('isInstantMeeting')}
     className="bg-orange-1"
   />

   <HomeCard
     img="/icons/schedule.svg"
     title="Schedule Meeting"
     description="Plan your meeting"
     handleClick={() => setMeetingState('isScheduleMeeting')}
     className="bg-blue-1"
     />
   <HomeCard
     img="/icons/recordings.svg"
     title="View Recordings"
     description="Chek out your recordings"
     handleClick={() => router.push('/recordings')}
     className="bg-purple-1"
   />
   <HomeCard
     img="/icons/join-meeting.svg"
     title="Join Meeting"
     description="via inavtion link"
     handleClick={() => setMeetingState('isJoininMeeting')}
     className="bg-yellow-1"
   />
    {!calldetails ? (
      <MeetingModel
      isOpen={meetingState === 'isScheduleMeeting' }
      onClose={() => setMeetingState(undefined)}
      title="Create Meeting"
      handleClick={creatMeeting}
      >
        <div className="flex flex-col gap-2.5">
          <label className="text-base text-normal leading-[22px] text-sky-2">Add a description</label>
          <Textarea className="border-none bg-dark-3 focus-visible:ring-0 focus-visible-ring-offset-0"
           onChange={(e) =>{
             setValues({...values,description:e.target.value})
           }}
          />
        </div>
        <div className="flex felx-col w-full gap-2.5">
        <label className="text-base text-normal leading-[22px] text-sky-2">selelct date and time</label>
        <ReactDatePicker
          selected={values.dateTime}
          onChange={(date) => setValues({...values,dateTime:date!})}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="MMMM d,yyyy h:mm aa"
          className="w-full rounded bg-dark-3 p-2 focus:outline-none"
        />
        </div>

      </MeetingModel>
    ):(
      <MeetingModel
      isOpen={meetingState === 'isScheduleMeeting' }
      onClose={() => setMeetingState(undefined)}
      title="Create Meeting"
      
      handleClick={() =>{
        navigator.clipboard.writeText(meetingLink);
        toast({title:'Link copied'})
      }}
      image="/icons/checked.svg"
      buttonIcon="/icons/copy.svg"
      buttonText="Copy Meeting Link"
   />
    )}

   <MeetingModel
      isOpen={meetingState === 'isInstantMeeting' }
      onClose={() => setMeetingState(undefined)}
      title="Start an Instant Meeting"
      className="text-center "
      buttonText="Start Meeting"
      handleClick={creatMeeting}
   />

    <MeetingModel
      isOpen={meetingState === 'isJoininMeeting' }
      onClose={() => setMeetingState(undefined)}
      title="Type link here"
      className="text-center "
      buttonText="Join Meeting"
      handleClick={() => router.push(values.link)}
     >

      <Input
       placeholder="Meeting link"
      className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
      onChange={(e) => setValues({...values,link:e.target.value})}
      />
     </MeetingModel>
   </section>
  )
}

export default MeetingTypeList