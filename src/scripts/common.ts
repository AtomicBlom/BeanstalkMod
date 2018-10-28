export const enum BeanstalkComponents {
    SeedAge = "beanstalk:seed_age"
}

export const enum BeanstalkEvents {
    NotifyPlayer = "beanstalk:notify_player"
}

export interface ISeedAgeComponent {
    tickCreated: number;
}