---
title: "Siddhant Bansal - EgoProceL"
layout: gridlay
excerpt: "Siddhant Bansal: EgoProceL"
sitemap: false
permalink: /egoprocel/
---

[comment]: Title
<h2 align="center">My View is the Best View:<br>Procedure Learning from Egocentric Videos</h2>

[comment]: Authors
<p style="text-align: center;">
<a href="https://sid2697.github.io" style="color: #CC0000"> Siddhant Bansal</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://www.cse.iitd.ac.in/~chetan/" style="color: #CC0000"> Chetan Arora</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://faculty.iiit.ac.in/~jawahar/index.html" style="color: #CC0000"> C.V. Jawahar</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</p>
<p style="text-align: center;"><a href="https://eccv2022.ecva.net/" style="color:#CC0000">ECCV 2022</a></p>

<p style="text-align: center;">

[Paper](https://arxiv.org/pdf/2207.10883){: .btn}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

[Dataset](https://sid2697.github.io/egoprocel/#download){: .btn}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

[Code](https://github.com/Sid2697/EgoProceL-egocentric-procedure-learning){: .btn}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

</p>

[comment]: ProcedureLearning
<h3>What is Procedure Learning?</h3>
<div style="text-align: justify">
Given multiple videos of a task, the goal is to identify the key-steps and their order to perform the task.

<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/procedure-learning.png" width="900px" />
		</div>
    <p>&nbsp;</p>
    <figcaption>
        Provided multiple videos of making a pizza, the goal is to identify the steps required to prepare the pizza and their order.
    </figcaption>
</figure>
</center>

<h2 align="center"><span style="color:DodgerBlue">EgoProceL Dataset</span></h2>

<video class="centered" width="100%" autoplay muted loop playsinline>
  <source src="{{ site.url }}{{ site.baseurl }}/images/projectpic/EgoProceL-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<figure style="width: 100%; float: left">
  <p class="caption_justify">
    EgoProceL is a large-scale dataset for procedure learning. It consists of 62 hours of egocentric videos recorded by 130 subjects performing 16 tasks for procedure learning. EgoProceL contains videos and key-step annotations for multiple tasks from [CMU-MMAC](http://kitchen.cs.cmu.edu/main.php), [EGTEA Gaze+](https://cbs.ic.gatech.edu/fpv/), and individual tasks like [toy-bike assembly](https://iplab.dmi.unict.it/MECCANO/), [tent assembly](https://sites.google.com/view/epic-tent), PC assembly, and PC disassembly.
  </p>
</figure>


<h3> Why an egocentric dataset for Procedure Learning?</h3>
Using third-person videos for procedure learning makes the manipulated object small in appearance and often occluded by the actor, leading to significant errors.
In contrast, we observe that videos obtained from first-person (egocentric) wearable cameras provide an unobstructed and clear view of the action.

<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/ECCV_diagrams-first_person_vs_third_person_v1.png" width="900px" />
		</div>
</figure>
</center>
<figure style="width: 100%; float: left">
  <p class="caption_justify">
    Existing datasets majorly consist of third-person videos for procedure learning. 
    Third-person videos contain issues like occlusion and atypical camera locations that makes them ill-suited for procedure learning.
    Additionally, the datasets rely on videos from YouTube that are noisy.
    In contrast, we propose to use egocentric videos that overcome the issues posed by third-person videos.
    Third-person frames in the figure are from ProceL and CrossTask and the first-person frames are from EgoProceL.
  </p>
</figure>

<h3> Overview of EgoProceL </h3>

EgoProceL consists of
- <b><u>62</u> hours</b> of videos captured by 
- <b><u>130</u> subjects</b> 
- performing <b><u>16</u> tasks</b>
- maximum of <b><u>17</u> key-steps</b>
- average <b><u>0.38</u> foreground ratio</b>
- average <b><u>0.12</u> missing steps ratio</b>
- average <b><u>0.49</u> repeated steps ratio</b>

A portion of EgoProceL consist of videos from the following datasets:
- [CMU-MMAC](http://kitchen.cs.cmu.edu/main.php)
- [EGTEA Gaze+](https://cbs.ic.gatech.edu/fpv/)
- [MECCANO](https://iplab.dmi.unict.it/MECCANO/)
- [EPIC-Tent](https://sites.google.com/view/epic-tent)

<h3 id="download"><span style="color:DodgerBlue">Downloads</span></h3>
<p>&nbsp;</p>
We recommend referring to the [README](https://github.com/Sid2697/EgoProceL-egocentric-procedure-learning/blob/main/EgoProceL-download-README.md) before downloading the videos. [Mirror link](http://cvit.iiit.ac.in/research/projects/cvit-projects/egoprocel).

<h4> Videos </h4>

Link: [OneDrive](https://iiitaphyd-my.sharepoint.com/:f:/g/personal/siddhant_bansal_research_iiit_ac_in/Ev14SL5JYtJNpVUUAhDMgEABbPnTYpbDUzBYAhQToyHmVw?e=cQu5by)

<h4> Annotations </h4>

Link: [OneDrive](https://iiitaphyd-my.sharepoint.com/:f:/g/personal/siddhant_bansal_research_iiit_ac_in/EgqvXb5syepDv1z-UAwsYEQBivEYauz8tuotty7eey32Ng?e=TNXpBE)

<h3 align="center"><span style="color:DodgerBlue">CnC framework for Procedure Learning</span></h3>

We present a novel self-supervised <b>Correspond and Cut (CnC) framework</b> for procedure learning. CnC identifies and utilizes the temporal correspondences between the key-steps across multiple videos to learn the procedure. Our experiments show that CnC outperforms the state-of-the-art on the benchmark ProceL and CrossTask datasets by 5.2% and 6.3%, respectively.
<p>&nbsp;</p>
<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/ECCV_diagrams-Methodology_v0-5.png" width="900px" />
		</div>
</figure>
</center>
<p>&nbsp;</p>
<figure style="width: 100%; float: left">
  <p class="caption_justify">
    CnC takes in multiple videos from the same task and passes them through the embedder network trained using the proposed TC3I loss.
    The goal of the embedder network is to learn similar embeddings for corresponding key-steps from multiple videos and for temporally close frames.
    The ProCut Module (PCM) localizes the key-steps required for performing the task.
    PCM converts the clustering problem to a multi-label graph cut problem.
    The output provides the assignment of frames to the respective key-steps and their ordering.
  </p>
</figure>

</div>
<p>&nbsp;</p>

[comment]: Paper
<h3> Paper </h3>

- PDF: <a href="{{ site.url }}{{ site.baseurl }}/papers/Procedure_Learning_from_Egocentric_Videos_camera-ready_v1-5_2022-07-20.pdf">Paper</a>; <a href="{{ site.url }}{{ site.baseurl }}/papers/Supplementary-Procedure_Learning_from_Egocentric_Videos_camera-ready_v1-4_2022-07-19.pdf">Supplementary</a>
- arXiv: [Paper](https://arxiv.org/pdf/2207.10883); [Abstract](http://arxiv.org/abs/2207.10883)
- ECCV: <b>Coming soon!</b>

[comment]: Code
<h3> Code </h3>
The code for this work is available on GitHub!<br>Link: <a href="https://github.com/Sid2697/EgoProceL-egocentric-procedure-learning">Sid2697/EgoProceL-egocentric-procedure-learning</a>

<h3> Acknowledgements </h3>

<p style="text-align: justify">
This work was supported in part by the Department of Science and Technology, Government of India, under DST/ICPS/Data-Science project ID T-138. A portion of the data used in this paper was obtained from <a href="http://kitchen.cs.cmu.edu/">kitchen.cs.cmu.edu</a> and the data collection was funded in part by the National Science Foundation under Grant No. EEEC-0540865. We acknowledge <a href="https://scholar.google.com/citations?user=k4TZSPQAAAAJ&hl=en">Pravin Nagar</a> and <a href="https://sagarverma.github.io/">Sagar Verma</a> for recording and sharing the PC Assembly and Disassembly videos at IIIT Delhi. We also acknowledge <a href="https://www.linkedin.com/in/jehlum-pandit/">Jehlum Vitasta Pandit</a> and [Astha Bansal](https://contemplationanddeepthoughts.home.blog/) for their help with annotating a portion of EgoProceL.
</p>

<p>&nbsp;</p>

Please consider citing the following works if you make use of the EgoProceL dataset:

```
@InProceedings{EgoProceLECCV2022,
author="Bansal, Siddhant
and Arora, Chetan
and Jawahar, C.V.",
title="My View is the Best View: Procedure Learning from Egocentric Videos",
booktitle = "European Conference on Computer Vision (ECCV)",
year="2022"
}

@InProceedings{CMU_Kitchens,
author = "De La Torre, F. and Hodgins, J. and Bargteil, A. and Martin, X. and Macey, J. and Collado, A. and Beltran, P.",
title = "Guide to the Carnegie Mellon University Multimodal Activity (CMU-MMAC) database.",
booktitle = "Robotics Institute",
year = "2008"
}

@InProceedings{egtea_gaze_p,
author = "Li, Yin and Liu, Miao and Rehg, James M.",
title =  "In the Eye of Beholder: Joint Learning of Gaze and Actions in First Person Video",
booktitle = "European Conference on Computer Vision (ECCV)",
year = "2018"
}

@InProceedings{meccano,
    author    = "Ragusa, Francesco and Furnari, Antonino and Livatino, Salvatore and Farinella, Giovanni Maria",
    title     = "The MECCANO Dataset: Understanding Human-Object Interactions From Egocentric Videos in an Industrial-Like Domain",
    booktitle = "Winter Conference on Applications of Computer Vision (WACV)",
    year      = "2021"
}

@InProceedings{tent,
author = "Jang, Youngkyoon and Sullivan, Brian and Ludwig, Casimir and Gilchrist, Iain and Damen, Dima and Mayol-Cuevas, Walterio",
title = "EPIC-Tent: An Egocentric Video Dataset for Camping Tent Assembly",
booktitle = "International Conference on Computer Vision (ICCV) Workshops",
year = "2019"
}
```

<p>&nbsp;</p>
<p>&nbsp;</p>
