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

<h2 align="center"><span style="color:DodgerBlue">EgoProceL Dataset</span> (<a href="https://sid2697.github.io/egoprocel/#download">Download</a>)</h2>

<h3> Why an egocentric dataset for Procedure Learning?</h3>
Using third-person videos for procedure learning makes the manipulated object small in appearance and often occluded by the actor, leading to significant errors.
In contrast, we observe that videos obtained from first-person (egocentric) wearable cameras provide an unobstructed and clear view of the action.

<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/ECCV_diagrams-first_person_vs_third_person_v1.png" width="900px" />
		</div>
    <p>&nbsp;</p>
    <figcaption>
        Existing datasets majorly consist of third-person videos for procedure learning. 
        Third-person videos contain issues like occlusion and atypical camera locations that makes them ill-suited for procedure learning.
        Additionally, the datasets rely on videos from YouTube that are noisy.
        In contrast, we propose to use egocentric videos that overcome the issues posed by third-person videos.
        Third-person frames in the figure are from ProceL and CrossTask and the first-person frames are from EgoProceL.
    </figcaption>
</figure>
</center>

<h3> Overview of EgoProceL </h3>

EgoProceL consists of
- <b><u>62</u> hours</b> of videos captured by 
- <b><u>130</u> subjects</b> 
- performing <b><u>16</u> tasks</b>
- maximum of <b><u>17</u> key-steps</b>
- average <b><u>0.38</u> foreground ratio</b>
- average <b><u>0.12</u> missing steps ratio</b>
- average <b><u>0.49</u> repeated steps ratio</b>

<h3 id="download"><span style="color:DodgerBlue">Downloads</span></h3>
<p>&nbsp;</p>

<h4> Videos </h4>

Link: <b>Coming Soon!</b>

<h4> Annotations </h4>

Link: <b>Coming Soon!</b>

<h3 align="center"><span style="color:DodgerBlue">CnC framework for Procedure Learning</span></h3>

We present a novel self-supervised <b>Correspond and Cut (CnC) framework</b> for procedure learning. CnC identifies and utilizes the temporal correspondences between the key-steps across multiple videos to learn the procedure. Our experiments show that CnC outperforms the state-of-the-art on the benchmark ProceL and CrossTask datasets by 5.2% and 6.3%, respectively.

<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/ECCV_diagrams-Methodology_v0-5.png" width="900px" />
		</div>
    <p>&nbsp;</p>
    <figcaption>
    CnC takes in multiple videos from the same task and passes them through the embedder network trained using the proposed TC3I loss.
    The goal of the embedder network is to learn similar embeddings for corresponding key-steps from multiple videos and for temporally close frames.
    The ProCut Module (PCM) localizes the key-steps required for performing the task.
    PCM converts the clustering problem to a multi-label graph cut problem.
    The output provides the assignment of frames to the respective key-steps and their ordering.
    </figcaption>
</figure>
</center>

</div>
<p>&nbsp;</p>

[comment]: Paper
<h3> Paper </h3>

- arXiv: <b>Coming soon!</b>
- ECCV: <b>Coming soon!</b>

[comment]: Code
<h3> Code </h3>
The code for this work is available on GitHub!<br>Link: <a href="https://github.com/Sid2697/EgoProceL-egocentric-procedure-learning">Sid2697/EgoProceL-egocentric-procedure-learning</a>

<p>&nbsp;</p>

Please consider citing if you make use of the EgoProceL dataset and/or the corresponding code:

```
Coming soon!
```

<p>&nbsp;</p>
<p>&nbsp;</p>
