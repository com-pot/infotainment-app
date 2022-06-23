<template>
    <div class="panel program-schedule-rough">
        <div class="caption">Program schedule rough</div>
        <div class="program-entry" v-for="i in 5" :key="i">
            <div class="title">Schedule entry {{ i+1}}.</div>
            <div class="location">The dungeon</div>
            <p class="body">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Delectus perspiciatis asperiores modi dolore voluptas ut. Omnis nesciunt sapiente sunt nostrum explicabo nihil nisi dolores, labore esse, quas, non velit vero.</p>
        </div>
    </div>
</template>
