export type Frequency = 'everyday' | number[]

export type HabitIcon =
  | 'sun'
  | 'dumbbell'
  | 'lotus'
  | 'book'
  | 'leaf'
  | 'moon'
  | 'run'
  | 'drop'
  | 'pen'
  | 'flame'
  | 'coffee'
  | 'bike'
  | 'heart'
  | 'bed'
  | 'apple'
  | 'code'
  | 'music'
  | 'phone'
  | 'stretch'
  | 'walk'
  | 'shower'
  | 'mountain'
  | 'snow'
  | 'target'
  | 'utensils'
  | 'brain'

export type Habit = {
  id: string
  name: string
  icon: HabitIcon
  color: string
  frequency: Frequency
  createdAt: string
}

export type Checkin = {
  habitId: string
  date: string
}

export type Store = {
  habits: Habit[]
  checkins: Checkin[]
  seeded: boolean
  hideSeptember: boolean
}

export type Tab = 'today' | 'weekly' | 'monthly' | 'arc'

export type Page = 'home' | 'progress' | 'data' | 'credits'

export type Progress = {
  done: number
  scheduled: number
}
