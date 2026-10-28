<?php

namespace Database\Seeders;

use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user1 = User::where('email', 'user1@example.com')->first();
        $user2 = User::where('email', 'user2@example.com')->first();

        if (! $user1 || ! $user2) {
            return;
        }

        $sampleLeads = [
            ['name' => 'Michael Scott', 'email' => 'michael.scott@dundermifflin.com', 'phone' => '+1 (570) 555-0101'],
            ['name' => 'Dwight Schrute', 'email' => 'dwight.schrute@schrutefarms.com', 'phone' => '+1 (570) 555-0102'],
            ['name' => 'Jim Halpert', 'email' => 'jim.halpert@athlead.com', 'phone' => '+1 (570) 555-0103'],
            ['name' => 'Pam Beesly', 'email' => 'pam.beesly@artdesigns.com', 'phone' => '+1 (570) 555-0104'],
            ['name' => 'Ryan Howard', 'email' => 'ryan.howard@wuphf.com', 'phone' => '+1 (212) 555-0105'],
            ['name' => 'Andy Bernard', 'email' => 'andy.bernard@cornellalumni.org', 'phone' => '+1 (607) 555-0106'],
            ['name' => 'Stanley Hudson', 'email' => 'stanley.hudson@crosswords.com', 'phone' => '+1 (570) 555-0107'],
            ['name' => 'Phyllis Vance', 'email' => 'phyllis.vance@vancerefrig.com', 'phone' => '+1 (570) 555-0108'],
            ['name' => 'Angela Martin', 'email' => 'angela.martin@catsanctuary.org', 'phone' => '+1 (570) 555-0109'],
            ['name' => 'Oscar Martinez', 'email' => 'oscar.martinez@stateaudits.gov', 'phone' => '+1 (570) 555-0110'],
            ['name' => 'Kevin Malone', 'email' => 'kevin.malone@scrantonic.com', 'phone' => '+1 (570) 555-0111'],
            ['name' => 'Toby Flenderson', 'email' => 'toby.flenderson@costaricaexp.com', 'phone' => '+1 (570) 555-0112'],
            ['name' => 'Kelly Kapoor', 'email' => 'kelly.kapoor@celebritybuzz.net', 'phone' => '+1 (570) 555-0113'],
            ['name' => 'Meredith Palmer', 'email' => 'meredith.palmer@outbackparty.com', 'phone' => '+1 (570) 555-0114'],
            ['name' => 'Creed Bratton', 'email' => 'creed.bratton@scubaquality.io', 'phone' => '+1 (570) 555-0115'],
            ['name' => 'Darryl Philbin', 'email' => 'darryl.philbin@athleap.com', 'phone' => '+1 (215) 555-0116'],
            ['name' => 'Jan Levinson', 'email' => 'jan.levinson@serenitybyjan.com', 'phone' => '+1 (212) 555-0117'],
            ['name' => 'David Wallace', 'email' => 'david.wallace@suckittoys.com', 'phone' => '+1 (203) 555-0118'],
            ['name' => 'Holly Flax', 'email' => 'holly.flax@nashuahr.com', 'phone' => '+1 (603) 555-0119'],
            ['name' => 'Erin Hannon', 'email' => 'erin.hannon@fosterkids.org', 'phone' => '+1 (570) 555-0120'],
            ['name' => 'Gabe Lewis', 'email' => 'gabe.lewis@sabrecinema.com', 'phone' => '+1 (850) 555-0121'],
            ['name' => 'Robert California', 'email' => 'bob.kazamakis@geodiversity.com', 'phone' => '+1 (305) 555-0122'],
            ['name' => 'Nellie Bertram', 'email' => 'nellie.bertram@specialprojects.uk', 'phone' => '+44 20 7946 0123'],
            ['name' => 'Clark Green', 'email' => 'clark.green@juniorassociates.com', 'phone' => '+1 (570) 555-0124'],
            ['name' => 'Pete Miller', 'email' => 'pete.miller@ploppaper.com', 'phone' => '+1 (570) 555-0125'],
            ['name' => 'Karen Filippelli', 'email' => 'karen.filippelli@uticabranch.com', 'phone' => '+1 (315) 555-0126'],
            ['name' => 'Roy Anderson', 'email' => 'roy.anderson@gravelhauling.com', 'phone' => '+1 (570) 555-0127'],
            ['name' => 'Danny Cordray', 'email' => 'danny.cordray@packageroutes.com', 'phone' => '+1 (570) 555-0128'],
            ['name' => 'Cathy Simms', 'email' => 'cathy.simms@floridatrip.com', 'phone' => '+1 (850) 555-0129'],
            ['name' => 'Charles Miner', 'email' => 'charles.miner@steelindustries.com', 'phone' => '+1 (410) 555-0130'],
            ['name' => 'Jo Bennett', 'email' => 'jo.bennett@tallahasseeholdings.com', 'phone' => '+1 (850) 555-0131'],
            ['name' => 'Todd Packer', 'email' => 'todd.packer@travelingsales.com', 'phone' => '+1 (570) 555-0132'],
            ['name' => 'Bob Vance', 'email' => 'bob.vance@vancerefrigeration.com', 'phone' => '+1 (570) 555-0133'],
            ['name' => 'Mose Schrute', 'email' => 'mose.schrute@beetfarms.org', 'phone' => '+1 (570) 555-0134'],
            ['name' => 'Val Johnson', 'email' => 'val.johnson@warehousefreight.com', 'phone' => '+1 (570) 555-0135'],
        ];

        $statuses = [
            LeadStatus::New,
            LeadStatus::Contacted,
            LeadStatus::Converted,
        ];

        $total = count($sampleLeads);

        foreach ($sampleLeads as $index => $leadData) {
            // Alternate between user1 and user2
            $user = ($index % 2 === 0) ? $user1 : $user2;
            $status = $statuses[$index % 3];
            // Varied created_at timestamps: spread over past 35 days, with varied hours
            $createdAt = now()->subDays($total - $index)->subHours($index % 12);

            Lead::updateOrCreate(
                ['email' => $leadData['email']],
                [
                    'user_id' => $user->id,
                    'name' => $leadData['name'],
                    'phone' => $leadData['phone'],
                    'status' => $status,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]
            );
        }
    }
}

