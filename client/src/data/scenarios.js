// 32 Nigerian school scenarios. Effects are meter deltas (clamped 0-100 in App).
// Budget meter: 100 = ₦500,000, so -10 budget ≈ ₦50,000 spent. Hints never reveal outcomes.
export const SCENARIOS = [
{ id:'s01', title:'Generator fuel wahala', category:'energy', context:'NEPA light has gone again and the school generator drinks fuel like water. Exam week is near and the computer lab needs power. What do you do, Environment Prefect?',
  options:[
    { label:'Run solar lamps and shift computer lessons to daytime', hint:'Think about free sunshine and when lessons really need power.', effects:{eco:10,budget:8,health:4,morale:2,reputation:6}, consequence:'Daylight lessons and solar lamps cut fuel use and fumes.' },
    { label:'Buy more fuel and run the generator all day', hint:'Quick fix, but what does it cost the air and the budget?', effects:{eco:-12,budget:-14,health:-6,morale:2,reputation:-4}, consequence:'The generator runs, but fuel money and smoke pile up.' },
    { label:'Share one generator timetable between classes', hint:'Sharing can stretch one resource further.', effects:{eco:5,budget:5,health:2,morale:-2,reputation:3}, consequence:'Classes share power in turns and fuel lasts longer.' },
    { label:'Ask pupils to bring kerosene lamps from home', hint:'Is an open flame safe in a classroom?', effects:{eco:-6,budget:2,health:-10,morale:-4,reputation:-8}, consequence:'Kerosene lamps are a fire and smoke risk indoors.' } ] },
{ id:'s02', title:'Plastic bottles block the drainage', category:'waste', context:'Rainy season is coming and plastic bottles are blocking the school drainage. Last year, water flooded the assembly ground. What is your plan?',
  options:[
    { label:'Organise a bottle clean-up and start a recycling corner', hint:'A clean drain today can prevent a flood tomorrow.', effects:{eco:12,budget:2,health:10,morale:8,reputation:8}, consequence:'The drain flows freely and bottles get a second life.' },
    { label:'Pay a cart pusher to dump the bottles in a nearby bush', hint:'Moving rubbish is not the same as managing it.', effects:{eco:-8,budget:-4,health:-6,morale:-2,reputation:-6}, consequence:'The bottles just become another community problem.' },
    { label:'Burn the bottles behind the school', hint:'Burning plastic makes smoke that hurts lungs.', effects:{eco:-14,budget:0,health:-12,morale:-4,reputation:-10}, consequence:'Toxic smoke fills the air and harms everyone nearby.' },
    { label:'Leave the drainage and hope the rain is light', hint:'Hope is not a flood plan.', effects:{eco:-4,budget:0,health:-8,morale:-4,reputation:-6}, consequence:'The first heavy rain floods the assembly ground.' } ] },
{ id:'s03', title:'Bare, dusty school field', category:'agriculture', context:'The school field is bare and dusty. Harmattan wind blows dust into classrooms and there is no shade at break time.',
  options:[
    { label:'Plant trees and a small school garden with pupils', hint:'Roots hold soil and leaves give shade.', effects:{eco:14,budget:-4,health:8,morale:10,reputation:10}, consequence:'Young trees and garden beds start to cool and green the field.' },
    { label:'Cement the whole field', hint:'Concrete stops dust, but what happens when it rains?', effects:{eco:-8,budget:-14,health:2,morale:-2,reputation:-2}, consequence:'No dust, but hot ground and fast rain run-off.' },
    { label:'Water the dust every morning', hint:'Water helps for an hour. What lasts longer?', effects:{eco:2,budget:-6,health:2,morale:0,reputation:0}, consequence:'The dust settles briefly, then returns.' },
    { label:'Ban break time on the field', hint:'Pupils still need play and fresh air.', effects:{eco:0,budget:0,health:0,morale:-10,reputation:-4}, consequence:'No dust, but unhappy pupils with nowhere to play.' } ] },
{ id:'s04', title:'Leaking borehole pump', category:'water', context:'The borehole pump leaks all day. Water pools around it, mosquitoes breed, and the tank still runs dry by afternoon.',
  options:[
    { label:'Report it fast and fix the washer, then add a tap rota', hint:'A small leak fixed early saves a lot of water.', effects:{eco:10,budget:-4,health:12,morale:4,reputation:8}, consequence:'The leak stops, the tank lasts, and mosquitoes lose their pool.' },
    { label:'Buy sachet water for everyone instead', hint:'Sachets cost money every day and add plastic waste.', effects:{eco:-8,budget:-12,health:2,morale:2,reputation:-2}, consequence:'Pupils drink, but plastic and costs pile up daily.' },
    { label:'Let pupils fetch water from a nearby stream', hint:'Is stream water safe without treatment?', effects:{eco:-2,budget:2,health:-12,morale:-2,reputation:-8}, consequence:'Untreated water brings stomach troubles.' },
    { label:'Ignore the leak; water will always leak a little', hint:'Small leaks add up to big waste.', effects:{eco:-10,budget:-6,health:-8,morale:-2,reputation:-4}, consequence:'Thousands of litres are lost and the pool grows.' } ] },
{ id:'s05', title:'Canteen serves food in plastic', category:'waste', context:'The canteen wraps every meal in single-use plastic and foam packs. The bins overflow by lunch every day.',
  options:[
    { label:'Switch to reusable plates and washable lunch boxes', hint:'Reuse beats single-use, every time.', effects:{eco:12,budget:-6,health:4,morale:4,reputation:8}, consequence:'Bin waste falls sharply and the yard looks cleaner.' },
    { label:'Keep plastic but add more bins', hint:'More bins hold rubbish; they do not reduce it.', effects:{eco:0,budget:-4,health:2,morale:0,reputation:2}, consequence:'The yard is tidier, but plastic use stays high.' },
    { label:'Ban the canteen from selling food', hint:'Pupils still need lunch.', effects:{eco:2,budget:0,health:-2,morale:-12,reputation:-6}, consequence:'Hunger and grumbling, with no real waste plan.' } ] },
{ id:'s06', title:'Harmattan dust in classrooms', category:'climate', context:'Harmattan is here. Dust blows through broken windows and pupils cough in class. Attendance is dropping.',
  options:[
    { label:'Fix windows, plant a windbreak hedge, and wet-mop floors', hint:'Block dust at the door, not in the lungs.', effects:{eco:8,budget:-6,health:12,morale:6,reputation:8}, consequence:'Classrooms stay cleaner and coughing eases.' },
    { label:'Close school until harmattan passes', hint:'Harmattan lasts months. What happens to learning?', effects:{eco:0,budget:0,health:4,morale:-10,reputation:-8}, consequence:'Lessons stop for weeks and pupils fall behind.' },
    { label:'Tell pupils to endure it', hint:'Dust in lungs is a health matter, not toughness.', effects:{eco:0,budget:0,health:-10,morale:-8,reputation:-6}, consequence:'Coughing spreads and attendance keeps falling.' } ] },
{ id:'s07', title:'Flood warning for Lagos-style rain', category:'disaster', context:'The weather forecast warns of heavy rain this week. The school sits near a low road that flooded last year.',
  options:[
    { label:'Clear drains, raise books off the floor, share a safety plan', hint:'Prepare before the rain, not during it.', effects:{eco:6,budget:-2,health:12,morale:4,reputation:10}, consequence:'When rain comes, the school is ready and calm.' },
    { label:'Wait and see if the rain really comes', hint:'Forecasts are warnings, not guesses to ignore.', effects:{eco:0,budget:0,health:-10,morale:-4,reputation:-8}, consequence:'Floodwater catches everyone unprepared.' },
    { label:'Send everyone home for the whole week', hint:'Safety matters, but is a full week the right call?', effects:{eco:0,budget:0,health:6,morale:-6,reputation:-2}, consequence:'Safe, but a week of learning is lost.' } ] },
{ id:'s08', title:'School farm: cassava or nothing?', category:'agriculture', context:'The school farm has space for a crop. The agriculture teacher wants something that feeds pupils and teaches climate-smart farming.',
  options:[
    { label:'Plant cassava, maize and vegetables in mixed rows', hint:'Mixed crops protect soil better than one crop alone.', effects:{eco:10,budget:4,health:6,morale:8,reputation:6}, consequence:'Mixed planting gives food, shade and healthier soil.' },
    { label:'Plant only one cash crop for quick money', hint:'One crop, one risk if rain or pests fail.', effects:{eco:-4,budget:6,health:0,morale:-2,reputation:0}, consequence:'Money comes in, but soil and food variety suffer.' },
    { label:'Leave the farm idle for the year', hint:'Idle land teaches nobody and feeds nobody.', effects:{eco:-2,budget:0,health:0,morale:-6,reputation:-4}, consequence:'A wasted year for the farm and the pupils.' } ] },
{ id:'s09', title:'Broken toilets, dirty hands', category:'sanitation', context:'Two toilets are broken and handwashing water has run out. Pupils are avoiding the toilets and skipping handwashing.',
  options:[
    { label:'Fix toilets, refill tippy-taps, run a hygiene week', hint:'Clean toilets and soap protect the whole school.', effects:{eco:4,budget:-8,health:14,morale:8,reputation:10}, consequence:'Toilets work, hands get washed, sickness drops.' },
    { label:'Lock the broken toilets and say nothing', hint:'Silence does not fix a health problem.', effects:{eco:0,budget:0,health:-12,morale:-6,reputation:-10}, consequence:'Pupils use unsafe corners instead.' },
    { label:'Ask pupils to use toilets at home only', hint:'A school day is long. Is that fair or safe?', effects:{eco:0,budget:0,health:-8,morale:-10,reputation:-6}, consequence:'Discomfort all day and health risks grow.' } ] },
{ id:'s10', title:'Paper waste mountain', category:'waste', context:'After exams, the school has a mountain of used paper. The caretaker wants to burn it all on Friday.',
  options:[
    { label:'Sort, reuse one-sided paper, and sell the rest for recycling', hint:'Paper has a second life before it becomes waste.', effects:{eco:12,budget:6,health:6,morale:4,reputation:8}, consequence:'Less smoke, some money back, and a recycling habit.' },
    { label:'Burn it all on Friday', hint:'Paper smoke still pollutes the air.', effects:{eco:-12,budget:0,health:-10,morale:-2,reputation:-8}, consequence:'Smoke over the school and a lost recycling chance.' },
    { label:'Dump it behind the hall', hint:'Out of sight is not out of the environment.', effects:{eco:-8,budget:0,health:-6,morale:-2,reputation:-6}, consequence:'Wind scatters paper across the compound.' } ] },
{ id:'s11', title:'Solar panels: spend or save?', category:'energy', context:'A donor offers to part-fund solar panels for the school hall. The school must add some of its own money.',
  options:[
    { label:'Take the offer and fund the school share from savings', hint:'Solar costs once and saves for years.', effects:{eco:14,budget:-12,health:6,morale:8,reputation:12}, consequence:'The hall runs on sunshine and fuel bills fall.' },
    { label:'Decline and keep buying fuel', hint:'Fuel is a bill that never ends.', effects:{eco:-6,budget:-8,health:-4,morale:-2,reputation:-4}, consequence:'The offer passes and fuel costs continue.' },
    { label:'Accept only if the donor pays everything', hint:'Good offers sometimes need a fair share.', effects:{eco:0,budget:0,health:0,morale:-2,reputation:-2}, consequence:'The donor moves on to another school.' } ] },
{ id:'s12', title:'Mosquitoes after the rain', category:'health', context:'After heavy rain, standing water sits in old tyres and broken buckets around the school. Mosquitoes are everywhere.',
  options:[
    { label:'Clear standing water, turn over tyres, and fix netting', hint:'No standing water, no mosquito nursery.', effects:{eco:8,budget:-2,health:14,morale:6,reputation:8}, consequence:'Bites drop and the compound is safer.' },
    { label:'Spray insecticide every day', hint:'Daily spraying has its own health and cost effects.', effects:{eco:-6,budget:-8,health:2,morale:-2,reputation:-2}, consequence:'Mosquitoes fall, but chemicals and costs rise.' },
    { label:'Do nothing; mosquitoes are normal in rainy season', hint:'Normal does not mean harmless.', effects:{eco:0,budget:0,health:-12,morale:-6,reputation:-6}, consequence:'Malaria risk rises for pupils and staff.' } ] },
{ id:'s13', title:'Charcoal for the home economics kitchen', category:'energy', context:'The home economics kitchen cooks with charcoal. Smoke fills the kitchen and charcoal costs keep rising.',
  options:[
    { label:'Switch to a clean cookstove and LPG with safety training', hint:'Cleaner cooking protects lungs and trees.', effects:{eco:10,budget:-8,health:12,morale:4,reputation:8}, consequence:'Less smoke, less wood cut, safer cooking lessons.' },
    { label:'Keep charcoal; it is what everyone uses', hint:'Common is not always healthy.', effects:{eco:-8,budget:-6,health:-8,morale:0,reputation:-2}, consequence:'Smoke and costs continue every term.' },
    { label:'Stop practical cooking lessons', hint:'Pupils lose skills they need.', effects:{eco:2,budget:2,health:4,morale:-10,reputation:-6}, consequence:'No smoke, but no cooking skills either.' } ] },
{ id:'s14', title:'Rainwater harvesting idea', category:'water', context:'Rain pours off the school roof every wet season, yet the school buys water in the dry season. A teacher suggests gutters and tanks.',
  options:[
    { label:'Fit gutters and tanks, filter and store rainwater', hint:'Catch the rain when it falls, use it when it is dry.', effects:{eco:12,budget:-10,health:8,morale:6,reputation:10}, consequence:'Free rainwater cuts dry-season water bills.' },
    { label:'Keep buying water; tanks are too much work', hint:'Buying water every dry season adds up.', effects:{eco:-4,budget:-10,health:0,morale:-2,reputation:-2}, consequence:'Water bills stay high year after year.' },
    { label:'Collect rain in open buckets', hint:'Open water breeds mosquitoes.', effects:{eco:2,budget:0,health:-10,morale:-2,reputation:-4}, consequence:'Water is collected, but mosquitoes move in.' } ] },
{ id:'s15', title:'Food waste at lunch', category:'waste', context:'Half-eaten lunches fill the bins daily. Some pupils go hungry while good food is thrown away.',
  options:[
    { label:'Start portion choice, a share table, and compost for scraps', hint:'Less waste, more sharing, richer soil.', effects:{eco:12,budget:4,health:6,morale:10,reputation:8}, consequence:'Food waste falls and the garden gets compost.' },
    { label:'Fine pupils who do not finish food', hint:'Fines do not teach portion sense.', effects:{eco:2,budget:2,health:-2,morale:-10,reputation:-6}, consequence:'Pupils eat in fear, waste barely changes.' },
    { label:'Throw everything away as usual', hint:'Waste is also wasted money and effort.', effects:{eco:-8,budget:-4,health:-2,morale:-2,reputation:-4}, consequence:'Bins overflow and nothing improves.' } ] },
{ id:'s16', title:'Old batteries in the bin', category:'waste', context:'Pupils toss used batteries in the normal bin. A science teacher warns that battery chemicals leak into soil and water.',
  options:[
    { label:'Start a battery collection box and a safe drop-off plan', hint:'Some waste needs special handling.', effects:{eco:12,budget:-2,health:10,morale:4,reputation:8}, consequence:'Harmful chemicals stay out of soil and water.' },
    { label:'Bury the batteries behind the school', hint:'Buried chemicals still leak.', effects:{eco:-10,budget:0,health:-10,morale:-2,reputation:-8}, consequence:'Soil and groundwater are poisoned quietly.' },
    { label:'Ignore it; batteries are small', hint:'Small things add up in large numbers.', effects:{eco:-6,budget:0,health:-6,morale:0,reputation:-4}, consequence:'Leaks continue unnoticed.' } ] },
{ id:'s17', title:'Heatwave: no shade, no water', category:'climate', context:'A heatwave hits during exam season. Classrooms are hot, pupils are tired, and the water dispenser is empty.',
  options:[
    { label:'Shift exams to cooler hours, refill water, open shaded study areas', hint:'Heat affects the brain as well as the body.', effects:{eco:4,budget:-4,health:12,morale:10,reputation:8}, consequence:'Pupils stay hydrated and can think clearly.' },
    { label:'Keep the timetable exactly as it is', hint:'Fair exams should not mean suffering in heat.', effects:{eco:0,budget:0,health:-10,morale:-8,reputation:-6}, consequence:'Heat exhaustion risks rise and results suffer.' },
    { label:'Cancel exams for the term', hint:'Cancelling is a big step. Is there a middle way?', effects:{eco:0,budget:0,health:6,morale:-6,reputation:-8}, consequence:'Safe, but a term of learning goes unmeasured.' } ] },
{ id:'s18', title:'E-waste: dead computers pile up', category:'waste', context:'Dead computers and phones pile up in the store room. Some pupils want to take parts home.',
  options:[
    { label:'Partner with a certified e-waste recycler and run a repair club', hint:'Repair first, recycle safely second.', effects:{eco:12,budget:4,health:8,morale:8,reputation:10}, consequence:'Working parts are reused; the rest is recycled safely.' },
    { label:'Let pupils take parts home freely', hint:'Old electronics can hold harmful materials.', effects:{eco:-4,budget:0,health:-8,morale:2,reputation:-4}, consequence:'Parts scatter and unsafe handling spreads.' },
    { label:'Burn the pile to clear space', hint:'Burning electronics releases toxic fumes.', effects:{eco:-14,budget:0,health:-14,morale:-4,reputation:-12}, consequence:'Toxic smoke and a serious health hazard.' } ] },
{ id:'s19', title:'School bus idling at the gate', category:'energy', context:'School buses idle at the gate for 30 minutes every morning, filling the air with exhaust while pupils walk past.',
  options:[
    { label:'Set a no-idling rule and a staggered drop-off', hint:'Engines off, air cleaner, same buses.', effects:{eco:10,budget:4,health:10,morale:2,reputation:6}, consequence:'Morning air clears and fuel is saved.' },
    { label:'Move the gate queue further from classrooms', hint:'Moving smoke does not remove it.', effects:{eco:-2,budget:-4,health:2,morale:0,reputation:0}, consequence:'Smoke shifts, but pupils still breathe it.' },
    { label:'Do nothing; buses must stay ready', hint:'Ready does not require running for 30 minutes.', effects:{eco:-8,budget:-4,health:-8,morale:-2,reputation:-4}, consequence:'Exhaust and fuel waste continue daily.' } ] },
{ id:'s20', title:'Erosion eats the school fence', category:'disaster', context:'Rain run-off is eating away the soil near the school fence. The fence is starting to lean.',
  options:[
    { label:'Plant grass and shrubs, dig a contour drain, and mulch', hint:'Plants and drains slow water down.', effects:{eco:12,budget:-6,health:6,morale:4,reputation:8}, consequence:'Soil stays put and the fence stands firm.' },
    { label:'Pour concrete over the eroded area', hint:'Concrete can push water problems elsewhere.', effects:{eco:-6,budget:-12,health:0,morale:0,reputation:0}, consequence:'The spot is covered, but run-off speeds up downhill.' },
    { label:'Wait until the fence falls, then repair it', hint:'Prevention is cheaper than rebuilding.', effects:{eco:-8,budget:-10,health:-6,morale:-2,reputation:-8}, consequence:'The fence falls and repairs cost far more.' } ] },
{ id:'s21', title:'Second-hand uniforms swap', category:'waste', context:'Many pupils outgrow uniforms each term. Parents buy new ones while good uniforms sit unused at home.',
  options:[
    { label:'Run a uniform swap and repair day each term', hint:'Reuse saves parents money and cuts waste.', effects:{eco:10,budget:6,health:0,morale:10,reputation:8}, consequence:'Uniforms get second lives and families save money.' },
    { label:'Insist every pupil buys brand-new uniforms', hint:'New is not always necessary.', effects:{eco:-6,budget:-2,health:0,morale:-6,reputation:-4}, consequence:'More waste, more cost for families.' },
    { label:'Do nothing about uniforms', hint:'A missed chance to help families and the planet.', effects:{eco:-2,budget:0,health:0,morale:-2,reputation:-2}, consequence:'Good uniforms stay unused at home.' } ] },
{ id:'s22', title:'Water vendor price hike', category:'water', context:'The water vendor doubles prices during dry season. The school budget is stretched and pupils drink less.',
  options:[
    { label:'Use stored rainwater and fix leaks to cut vendor water', hint:'Stored water is independence from price hikes.', effects:{eco:10,budget:8,health:8,morale:4,reputation:6}, consequence:'The school drinks safely without paying double.' },
    { label:'Pay the higher price and cut other spending', hint:'Paying more leaves less for books and repairs.', effects:{eco:0,budget:-14,health:4,morale:-4,reputation:-2}, consequence:'Water flows, but the budget bleeds.' },
    { label:'Ration water to one cup per pupil', hint:'Thirsty pupils cannot learn well.', effects:{eco:2,budget:6,health:-12,morale:-10,reputation:-8}, consequence:'Dehydration and headaches in class.' } ] },
{ id:'s23', title:'Open burning of leaves', category:'waste', context:'The caretaker burns dry leaves every week. Smoke drifts into classrooms during lessons.',
  options:[
    { label:'Compost leaves for the garden instead', hint:'Leaves become food for soil.', effects:{eco:12,budget:2,health:10,morale:4,reputation:8}, consequence:'Rich compost, clean air, happy garden.' },
    { label:'Burn leaves only on weekends', hint:'Less smoke is still smoke.', effects:{eco:-4,budget:0,health:-2,morale:0,reputation:-2}, consequence:'Smoke drops, but the habit stays.' },
    { label:'Keep burning; leaves must go somewhere', hint:'Compost is a somewhere, too.', effects:{eco:-10,budget:0,health:-8,morale:-2,reputation:-6}, consequence:'Weekly smoke continues.' } ] },
{ id:'s24', title:'Pupils litter the assembly ground', category:'waste', context:'After assembly, the ground is covered in sweet wrappers and paper. Prefects are tired of picking it up alone.',
  options:[
    { label:'Place bins at exits, add a litter-pick rota, and praise clean classes', hint:'Systems and praise beat nagging.', effects:{eco:10,budget:-2,health:4,morale:8,reputation:8}, consequence:'The ground stays clean and pupils own the habit.' },
    { label:'Punish the whole school for littering', hint:'Blame for all rarely changes the few.', effects:{eco:2,budget:0,health:0,morale:-12,reputation:-6}, consequence:'Resentment grows; litter barely moves.' },
    { label:'Cancel assembly to avoid litter', hint:'Assembly matters. Is there a better fix?', effects:{eco:2,budget:0,health:0,morale:-10,reputation:-6}, consequence:'No litter, but no assembly either.' } ] },
{ id:'s25', title:'Drought hits the school garden', category:'agriculture', context:'Dry season is long this year. The school garden wilts and the agriculture club is discouraged.',
  options:[
    { label:'Mulch, water early morning, and plant drought-tough crops', hint:'Mulch keeps water in the soil.', effects:{eco:10,budget:-2,health:4,morale:8,reputation:6}, consequence:'The garden survives and pupils learn dry-season farming.' },
    { label:'Water at midday with a hose running freely', hint:'Midday water evaporates fast.', effects:{eco:-4,budget:-6,health:0,morale:0,reputation:-2}, consequence:'Water wasted, plants still thirsty.' },
    { label:'Abandon the garden until rains return', hint:'A garden can teach even in dry season.', effects:{eco:-6,budget:0,health:0,morale:-8,reputation:-4}, consequence:'The club loses heart and the soil dries out.' } ] },
{ id:'s26', title:'Noise and fumes from a nearby workshop', category:'health', context:'A workshop next door runs loud machines and burns waste. Lessons are disrupted and pupils cough.',
  options:[
    { label:'Talk to the workshop, plant a hedge, and seal classroom gaps', hint:'Neighbours and barriers both help.', effects:{eco:6,budget:-4,health:10,morale:6,reputation:6}, consequence:'Noise and smoke fall and lessons improve.' },
    { label:'Shout at the workshop owner', hint:'A fight rarely fixes a shared problem.', effects:{eco:0,budget:0,health:-2,morale:-4,reputation:-6}, consequence:'Tension grows, smoke stays.' },
    { label:'Move all lessons to the far side and ignore it', hint:'Ignoring a health problem does not remove it.', effects:{eco:0,budget:-2,health:-6,morale:-4,reputation:-4}, consequence:'Some relief, but smoke still reaches the school.' } ] },
{ id:'s27', title:'Exam paper printing overload', category:'waste', context:'The school prints thousands of exam pages, many with errors, and reprints them all.',
  options:[
    { label:'Proof before printing, print double-sided, reuse misprints as scrap', hint:'Proofing saves paper before the printer runs.', effects:{eco:12,budget:8,health:0,morale:2,reputation:6}, consequence:'Paper and money saved, exams still run well.' },
    { label:'Print single-sided as usual and bin the errors', hint:'Single-sided doubles paper use.', effects:{eco:-8,budget:-8,health:0,morale:0,reputation:-2}, consequence:'Waste and costs pile up every exam season.' },
    { label:'Ban printed exams entirely this term', hint:'Not every pupil has a device. Think it through.', effects:{eco:6,budget:2,health:0,morale:-8,reputation:-4}, consequence:'Paper saved, but many pupils cannot sit exams fairly.' } ] },
{ id:'s28', title:'Stagnant water in the playground', category:'sanitation', context:'A low corner of the playground holds stagnant water for days after rain. Pupils splash in it and shoes get ruined.',
  options:[
    { label:'Fill and level the corner, clear the drain, and mark it safe', hint:'Standing water is a health risk, not a playground.', effects:{eco:6,budget:-6,health:12,morale:6,reputation:8}, consequence:'The corner dries and play is safe again.' },
    { label:'Fence the corner off and leave the water', hint:'Fencing hides the problem, not the mosquitoes.', effects:{eco:-2,budget:-2,health:-8,morale:-4,reputation:-4}, consequence:'Mosquitoes still breed behind the fence.' },
    { label:'Let pupils play in it; water is fun', hint:'Stagnant water can carry germs.', effects:{eco:-2,budget:0,health:-12,morale:2,reputation:-8}, consequence:'Fun today, sickness tomorrow.' } ] },
{ id:'s29', title:'Kerosene vs solar for evening prep', category:'energy', context:'Boarding pupils prep in the evening. Kerosene lamps flicker, smell, and strain eyes. Solar lanterns cost money upfront.',
  options:[
    { label:'Buy solar lanterns for prep classes', hint:'Sunlight by day, safe light by night.', effects:{eco:12,budget:-10,health:10,morale:8,reputation:8}, consequence:'Bright, safe light and no more kerosene fumes.' },
    { label:'Keep kerosene; it is cheaper this term', hint:'Cheap this term can be costly for health.', effects:{eco:-8,budget:2,health:-10,morale:-4,reputation:-4}, consequence:'Eyes strain and fumes linger every evening.' },
    { label:'Cancel evening prep', hint:'Prep time matters for boarding pupils.', effects:{eco:2,budget:0,health:4,morale:-10,reputation:-6}, consequence:'No fumes, but no prep either.' } ] },
{ id:'s30', title:'Community dumps waste by the school wall', category:'waste', context:'Neighbours dump household waste by the school wall at night. The smell reaches classrooms by morning.',
  options:[
    { label:'Meet community leaders, add bins, and run a clean-wall campaign', hint:'A shared wall needs a shared solution.', effects:{eco:10,budget:-4,health:10,morale:6,reputation:10}, consequence:'Dumping stops and the wall becomes a pride spot.' },
    { label:'Build a higher wall to hide the waste', hint:'Hiding waste does not stop smell or germs.', effects:{eco:-4,budget:-12,health:-4,morale:-2,reputation:-2}, consequence:'Waste piles higher behind a taller wall.' },
    { label:'Burn the dumped waste each morning', hint:'Burning other people\'s waste still pollutes your air.', effects:{eco:-12,budget:0,health:-10,morale:-2,reputation:-8}, consequence:'Morning smoke over the school.' } ] },
{ id:'s31', title:'Textbook sharing shortage', category:'energy', context:'There are not enough textbooks for every pupil. Some pupils photocopy whole books, using paper and money.',
  options:[
    { label:'Run a shared textbook rota and a reading corner', hint:'Sharing stretches one book across many pupils.', effects:{eco:8,budget:6,health:0,morale:8,reputation:6}, consequence:'Every pupil reads, paper use falls.' },
    { label:'Photocopy whole books for everyone', hint:'Copying whole books wastes paper and may break rules.', effects:{eco:-10,budget:-10,health:0,morale:2,reputation:-4}, consequence:'Paper mountain, budget drain.' },
    { label:'Let pupils without books just listen', hint:'Listening alone is not equal learning.', effects:{eco:0,budget:0,health:0,morale:-10,reputation:-6}, consequence:'Some pupils fall behind quietly.' } ] },
{ id:'s32', title:'School pond for science lessons', category:'water', context:'The science teacher wants a small school pond for lessons on water life. Others worry about mosquitoes and safety.',
  options:[
    { label:'Build a small covered pond with fish that eat larvae, plus safety rules', hint:'A managed pond teaches; an unmanaged one breeds mosquitoes.', effects:{eco:10,budget:-6,health:6,morale:10,reputation:8}, consequence:'Living science lessons, safely managed.' },
    { label:'Build an open pond with no plan', hint:'Open still water invites mosquitoes.', effects:{eco:2,budget:-4,health:-12,morale:2,reputation:-6}, consequence:'Lessons happen, but mosquito risk rises.' },
    { label:'Reject the pond idea outright', hint:'Safety rules can make good ideas safe.', effects:{eco:0,budget:0,health:2,morale:-6,reputation:-2}, consequence:'No pond, no living science lessons.' } ] }
];
export const MONTHS = ['September','October','November','December','January','February','March','April','May','June','July','August'];
// 12 turns: the September-July teaching year plus an August closing turn,
// so the game has the 12 turns the brief asks for.
export const SCHOOL_MONTHS = ['September','October','November','December','January','February','March','April','May','June','July','August'];
export function seasonForMonth(month){
  if (['April','May','June','July','September','October'].includes(month)) return 'rainy';
  if (['December','January','February'].includes(month)) return 'harmattan';
  return 'dry';
}
export function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
