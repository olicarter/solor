'use client'

import { useEffect, useState } from 'react'
import { readableColor } from 'polished'
import { addHours, differenceInMinutes, format, startOfToday } from 'date-fns'
import SunCalc, { GetTimesResult } from 'suncalc'

const config: Record<keyof GetTimesResult, { s: number; l: number }> = {
  nadir: { s: 15, l: 15 },
  nightEnd: { s: 25, l: 25 },
  nauticalDawn: { s: 35, l: 35 },
  dawn: { s: 45, l: 45 },
  sunrise: { s: 55, l: 55 },
  sunriseEnd: { s: 65, l: 65 },
  goldenHourEnd: { s: 75, l: 75 },
  solarNoon: { s: 85, l: 85 },
  goldenHour: { s: 75, l: 75 },
  sunsetStart: { s: 65, l: 65 },
  sunset: { s: 55, l: 55 },
  dusk: { s: 45, l: 45 },
  nauticalDusk: { s: 35, l: 35 },
  night: { s: 25, l: 25 },
}

const hue = 210

export default function Home() {
  const [now] = useState(new Date())
  const [times, setTimes] = useState<
    {
      name: keyof GetTimesResult
      date: Date
      s: number
      l: number
    }[]
  >()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude
      const long = position.coords.longitude
      const timesObj = SunCalc.getTimes(new Date(), lat, long)
      setTimes(
        // @ts-ignore
        Object.entries(timesObj)
          .sort(([, a], [, b]) => a.getTime() - b.getTime())
          .map(([name, date]) => ({
            name,
            date,
            s: config[name as keyof GetTimesResult].s,
            l: config[name as keyof GetTimesResult].l,
          })),
      )
    })
  }, [])

  if (times === undefined) return null

  const getSLForDate = (date: Date) => {
    const nowIndex = [...times, { name: 'now', date }]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .findIndex(i => i.name === 'now')
    const prevTime =
      nowIndex === 0 ? times[times.length - 1] : times[nowIndex - 1]
    const nextTime = nowIndex === times.length ? times[0] : times[nowIndex]
    const percent =
      differenceInMinutes(date, prevTime.date) /
      differenceInMinutes(nextTime.date, prevTime.date)
    return {
      s: Math.round(
        config[prevTime.name].s +
          (config[nextTime.name].s - config[prevTime.name].s) * percent,
      ),
      l: Math.round(
        config[prevTime.name].l +
          (config[nextTime.name].l - config[prevTime.name].l) * percent,
      ),
    }
  }

  const { s: nowS, l: nowL } = getSLForDate(now)

  document.querySelector(
    'html',
  )!.style.backgroundColor = `hsl(${hue}, ${nowS}%, ${nowL}%)`

  return (
    <div className="cursor-default grid grid-cols-2 h-screen w-screen">
      <div
        className="flex flex-col gap-6 p-8 text-justify text-sm"
        style={{
          backgroundColor: `hsl(${hue}, ${nowS}%, ${nowL}%)`,
          color: readableColor(`hsl(${hue}, ${Math.round(nowS)}%, ${nowL}%)`),
        }}
      >
        <h1 className="font-semibold text-3xl">
          solor <span className="text-sm">noun</span>
        </h1>
        <p>
          <h4 className="font-bold inline">pronounciation</h4> /ˈso-lor/
        </p>
        <p>
          <h4 className="font-bold inline">definition</h4> Solor, a whimsical
          fusion of &quot;solar&quot; and &quot;color,&quot; refers to the shade
          or hue that is most suitable and harmonious for a specific time of day
          in a particular geographical location. This term acknowledges the
          dynamic interplay between the sun&apos;s position in the sky and the
          local environment, recognizing that the color palette that complements
          a place can change dramatically as the day progresses.
        </p>
        <p>
          <h4 className="font-bold inline">etymology</h4> &quot;Solor&quot; is a
          portmanteau of &quot;solar,&quot; relating to the sun, and
          &quot;color,&quot; representing the visual quality of an object as
          determined by its reflected or transmitted light. This term
          encapsulates the notion that the ideal color can be closely tied to
          the position of the sun during the day, making it a perfect blend for
          the concept of time-specific color choices.
        </p>
        <p>
          <h4 className="font-bold inline">example</h4> The solor of the walls
          in our beachfront cottage shifted from a soft, sandy beige in the
          morning to a tranquil seafoam green in the afternoon, creating a
          serene atmosphere.
        </p>
        <p>
          <h4 className="font-bold inline">example</h4> The designer selected a
          warm, golden solor for the living room, inspired by the radiant hues
          of the setting sun over the desert landscape.
        </p>
        <p>
          <h4 className="font-bold inline">example</h4> When choosing outdoor
          furniture, consider the solor of the local twilight to create a
          backyard oasis that comes to life at dusk.
        </p>
      </div>
      <ul className="flex font-bold font-[monospace] font-xs leading-none relative">
        <ul className="absolute bottom-0 flex flex-col top-0 p-1 z-10">
          {new Array(24).fill(null).map((_, index) => {
            const date = addHours(startOfToday(), index)
            const { s, l } = getSLForDate(date)
            return (
              <span
                key={index}
                className="flex-1"
                style={{
                  color: readableColor(`hsl(${hue}, ${s}%, ${l}%)`),
                }}
              >
                {format(date, 'HHmm').endsWith('00')
                  ? format(date, 'HHmm')
                  : null}
              </span>
            )
          })}
        </ul>

        <li
          className="absolute flex justify-end p-1 w-full"
          style={{
            backgroundColor: `hsl(${hue}, ${config.night.s}%, ${config.night.l}%)`,
            color: readableColor(
              `hsl(${hue}, ${config.night.s}%, ${config.night.l}%)`,
            ),
            height: `${(Number(format(times[0].date, 'Hmm')) / 2400) * 100}%`,
          }}
        >
          0000
        </li>
        {times.map(({ name, date }, index) => {
          const time = config[name]
          return (
            <li
              key={name}
              className="absolute flex justify-end p-1 w-full"
              style={{
                backgroundColor: `hsl(${hue}, ${time.s}%, ${time.l}%)`,
                color: readableColor(`hsl(${hue}, ${time.s}%, ${time.l}%)`),
                height: `${
                  (((index === times.length - 1
                    ? 2400
                    : Number(format(times[index + 1].date, 'Hmm'))) -
                    Number(format(date, 'Hmm'))) /
                    2400) *
                  100
                }%`,
                top: `${(Number(format(date, 'Hmm')) / 2400) * 100}%`,
              }}
            >
              {format(date, 'HHmm')}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
