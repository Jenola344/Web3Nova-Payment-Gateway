import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Your CSV data as a string
const csvData = `SCHOLARSHIP_TYPE,FULL NAME,EMAIL ADDRESS,PHONE NUMBER,SKILL TO BE ADDMITED TO,LOCATION FOR CLASS
Fully Funded,Jesutola Olusegun,jesutolaolusegun@gmail.com,08138003389,Smart Contract,Pysically
Fully Funded,Isaac Makinde,ismakinde@gmail.com,08053744603,Smart Contract,Online
Fully Funded,Shittu Israel  Oluwafisayomi,shittuisrael004@gmail.com,08136695747,Smart Contract,Pysically
Fully Funded,Fasumirin Pamilerin Israel,pamilerinfash@gmail.com,09031955417,Smart Contract,Pysically
Fully Funded,Omolayo Temitayo Samuel,temitayoomolayo@gmail.com,08147941672,Smart Contract,Pysically
Fully Funded,Oderinde Esther,estheroderinde887@gmail.com,08168408833,Web Development,Online
Fully Funded,Oyedeji Samuel Oluwabgayi,novaproxy49@gmail.com,08107001668,Frontend and Smart Contract,Pysically
Fully Funded,Taiwo Joel,oluwatofunmijoel765@gmail.com,09126233897,Smart Contract,pysically
Fully Funded,Heritage Adeyemo,heritageadebayo1@gmail.com,07049315903,Smart Contract,Online
Fully Funded,Toluwanimi David,omoyenitoluwanimi@gmail.com,09032025711,UI/UX Design,pysically
Fully Funded,Adebayo John,adebayodeolu90@gmail.com,08143333272,Smart Contract,pysically
Fully Funded,Agunbiade Bukunmi,oluwabukunmiadeolu13@gmail.com,09073101777,Web Development,Pysically
Fully Funded,Ogidan Sammuel,ogidantofunmi230@gmail.com,08144016791,Web Development,Pysically
Fully Funded,Abiodun Bamidoro,abiodunbamiduro111@gmail.com,08166998699,UI/UX Design,Online
Fully Funded,Adeyeye Boluwatife,adeyeyeboluwatife75@gmail.com,09038361107,Web Development,pysically
Fully Funded,Idowu Marvellous,marvellousidowu013@gmail.com,08135861755,Smart Contract,pysically
Fully Funded,Ogunmode Joel Taiwo,ogunmodedejoel1@gmail.com,08032172841,Web Development,Pysically
Fully Funded,Lebi Oluwatobiloba Adewale,lebiooluwatobiloba@gmail.com,08163503731,UI/UX Design,Pysically
Fully Funded,Ademusayo Samuel,ademolaademusayo1@gmail.com,09153047352,Smart Contract,Pysically
Fully Funded,Anifowose anuoluwapo,hifedolapo5@gmail.com,09037689361,Smart Contract,Pysically
Fully Funded,Johnpaul fabian chiazokam,hjohnpaul90@gmail.com,09044176625,UI/UX Design,Online
Fully Funded,Adelekun Aderinsola Oluwasubomi,adelekunaderinsola0@gmail.com,08053302445,UI/UX Design,Pysically
Fully Funded,Sharon Oluwanifemi,sharondami13@gmail.com,08165992492,UI/UX Design,Pysically
Fully Funded,Triumphant Oluwadamilare,oluwadamilaretriumphant@gmail.com,08160166543,Smart Contract,Pysically
Fully Funded,Victory Anlekan,trovic101@gmail.com,09155572494,Smart Contract,Pysically
Fully Funded,Kusimo Emmanuel,kusimoemmanuelboluwatife@gmail.com,08140514328,UI/UX Design,Pysically
Half Funded,Oluwasina Dunsin,oluwasinapromise@gmail.com,09067124424,Smart Contract,Pysically
Half Funded,Olugboja Kehinde Opeyemi,keendamiel03@gmail.com,07066576774,Smart Contract,Pysically
Half Funded,James Kyle,kyledigitalagency07@gmail.com,09138425484,Smart Contract,Pysically
Half Funded,Akomolafe Ayomiposi,ayomiposi2349j22@gmail.com,09032391646,Web Development,Pysically
Half Funded,Ayomidun Inioluwa Isreal,ayomiduninioluwa@gmail.com,08103838154,UI/UX Design,Pysically
Half Funded,Nzenwata Chislon Chichereya,chislonnzenwata@gmail.com,07046399685,Smart Contract,Pysically
Half Funded,Idowu Stephen Boluwatife,stephenboluwatifeidowu@gmail.com,07045792432,UI/UX Design,Pysically
Half Funded,Thomas Olawajana,stephenboluwatifeidowustephenboluwatifeidowu@gmail.com,07041993693,Web Development,Pysically
Half Funded,Oluwaseyi Ayodele,seyiayodele69@gmail.com,08036473116,Smart Contract,Pysically
Half Funded,Cole Oreoluwanimi,cohlsonworld@gmail.com,08034213014,Web Development,Pysically
Half Funded,Precious Kelvin,precioustemad@gmail.com,07046531695,Web Development,Pysically
Half Funded,Haddy Olusegun Aminu,haddyaminuo2@gmail.com,07025364543,Smart Contract,Pysically
Half Funded,Oluwabukola Khadyah,abdulwasiikhadijah@gmail.com,09064355836,UI/UX Design,Pysically
Half Funded,Ephiram,officialaspectratio@gmail.com,08101071377,UI/UX Design,Pysically
Half Funded,Testimony Owolabi,owolabitestimony7724@gmail.com,09049339759,Smart Contract,Pysically
Half Funded,Ayodeji Samuel,akindukoas2019@gmail.com,08089770474,UI/UX Design,Pysically
Half Funded,Adebote Arewaoluwa Beloved,debomuse@gmail.com,07043766427,Web Development,Pysically
Half Funded,Favour Odunayo,favourodunayo99@gmail.com,07025317903,UI/UX Design,Pysically
Half Funded,Okeke Chibueze,ochibuezexavierochibuezexavier@gmail.com,08146686469,UI/UX Design,Pysically
Half Funded,Joshua Arch,akinlayotoluwanimi@gmail.com,09136088581,UI/UX Design,Pysically
Half Funded,Esther Adegoroye,estherkome2020@gmail.com,07052662804,Web Development,Online
Half Funded,Aligwo Clinton,aligwoclinton@gmail.com,070163242,Web Development,Pysically
Half Funded,Hope,hopeoveze14hopeoveze14@gmail.com,08025506579,Web Development,Online
Half Funded,Adekoya Ademiitura,ademiituraadekoya23@gmail.com,08078625436,Web Development,Pysically
Half Funded,Gabriel Gift,giftgabrielehi@gmail.com,09060680875,Web Development,Pysically
Half Funded,Elvis,elvismichael560@gmail.com,08102522960,UI/UX Design,Pysically
Half Funded,Oluwasola Feranmi,feranmioluwasola18@gmail.com,0800000000,Web Development,Pysically
Half Funded,Ayobami Akomolafe,aymajesty12@gmail.com,08146482877,Web Development,Pysically
Half Funded,Osamede Gideon,osamedegideon8@gmail.com,08135699491,Smart Contract,Online
Half Funded,Abiri Godwin,godwinabiri456@gmail.com,08135699491,Web Development,Pysically
Half Funded,Onyeulo Uchenna,messagethethinker@gmail.com,08106170980,Smart Contract,Pysically
Half Funded,Adeola Anjola,dynaking19@gmail.com,07040376655,Smart Contract,Pysically
Half Funded,Akintola Nelson,nelsomaxi01@gmail.com,08055042107,Smart Contract,Pysically
Half Funded,Excellent,excellentmichael2110@gmail.com,08066688966,Web Development,Pysically
Half Funded,Keshinro Joseph,tanitoluwakeshinro@gmail.com,09078637040,Web Development,Pysically
Half Funded,Bamidele Khalid,khalidishola22@gmail.com,08039743412,UI/UX Design,Online
Half Funded,Afolabi David,Davidafolabi360@gmail.com,07043293995,UI/UX Design,Pysically
Half Funded,Orichia Samuel,orichasamuel3119@gmail.com,08131191245,Smart Contract,Pysically
Half Funded,Nhmeyene Edet,mmeyeneetimedet@gmail.com,07089762407,Smart Contract,Online
Half Funded,Solomon Tujiri,solomontejiri4@gmail.com,09062887442,Smart Contract,Online
Half Funded,Olatudun Benedict,olatundunbenedict@gmail.com,08108787044,UI/UX Design,Pysically
Half Funded,Fareedah,fareedahtitilayo30@gmail.com,08143021437,Web Development,Pysically
Half Funded,komolafe Excellence,Excellencekomolafe@gmail.com,09042731903,Web Development,Pysically
Half Funded,Olanibi Adeolu,olanibiadeolu@gmail.com,07026431799,Smart Contract,Pysically
Half Funded,Akintayo Morzuq Oyinlola,morzuqakintayo@gmail.com,07047541839,UI/UX Design,Pysically
Half Funded,Obaremo Elijah,elijahopemipo60@gmail.com,08137887107,Web Development,Pysically
Half Funded,Kolawole Toheeb Adeola,adeolakolawole2002@gmail.com,07042927291,Web Development,Pysically
Half Funded,Umoh Isaac,issacujay@gmail.com,09130059663,Web Development,Physically
Half Funded,Timothy,Timothyolamideji@gmail.com,08145011894,Web Development,Pysically`;

const API_URL = 'http://localhost:5000/auth/register/student';

interface Student {
  scholarshipType: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  skill: string;
  location: string;
}

interface RegistrationResult {
  success: boolean;
  student: string;
  response?: string;
  error?: string;
}

// Parse CSV
function parseCSV(csvString: string): Student[] {
  const lines = csvString.trim().split('\n');
  const students: Student[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 5) {
      students.push({
        scholarshipType: values[0].trim(),
        fullName: values[1].trim(),
        email: values[2].trim(),
        phoneNumber: values[3].trim(),
        skill: values[4].trim(),
        location: values[5] ? values[5].trim() : 'Pysically'
      });
    }
  }

  return students;
}

// Register a single student
async function registerStudent(student: Student): Promise<RegistrationResult> {
  const payload = {
    fullName: student.fullName,
    email: student.email,
    phoneNumber: student.phoneNumber,
    skill: student.skill,
    location: student.location,
    scholarshipType: student.scholarshipType,
    password: `${student.email.split('@')[0]}`
  };

  const curlCommand = `curl -X POST ${API_URL} -H "Content-Type: application/json" -d "${JSON.stringify(payload).replace(/"/g, '\\"')}"`;

  try {
    const { stdout } = await execPromise(curlCommand);
    return { success: true, student: student.fullName, response: stdout };
  } catch (error: any) {
    return { success: false, student: student.fullName, error: error.message };
  }
}

// Main function
async function registerAllStudents() {
  console.log('Starting student registration...\n');
  
  const students = parseCSV(csvData);
  console.log(`Found ${students.length} students to register\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    console.log(`[${i + 1}/${students.length}] Registering: ${student.fullName}...`);
    
    const result = await registerStudent(student);
    
    if (result.success) {
      successCount++;
      console.log(`✓ Success: ${result.student}`);
      console.log(`Response: ${result.response}`);
    } else {
      failCount++;
      console.log(`✗ Failed: ${result.student} - ${result.error}`);
    }
    
    console.log('---');
    
    // Add small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=== Registration Complete ===');
  console.log(`Total: ${students.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

// Run the script
registerAllStudents().catch(console.error);