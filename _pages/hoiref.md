---
title: "Siddhant Bansal - HOI-Ref"
layout: gridlay
excerpt: "Siddhant Bansal: HOI-Ref"
sitemap: false
permalink: /hoi-ref/
---

[comment]: Title
<h2 align="center">HOI-Ref: Hand-Object Interaction Referral in Egocentric Vision</h2>

[comment]: Authors
<p style="text-align: center;">
<a href="https://sid2697.github.io" style="color: #CC0000"> Siddhant Bansal</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://mwray.github.io/" style="color: #CC0000"> Michael Wray</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://dimadamen.github.io/" style="color: #CC0000"> Dima Damen</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</p>
<!-- <p style="text-align: center;"><a href="" style="color:#CC0000">XXXX 2024</a></p> -->

<p style="text-align: center;">
[Paper](https://arxiv.org/abs/2404.09933){: .btn}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

[Dataset](https://github.com/Sid2697/HOI-Ref/blob/main/hoiqa_dataset/HOIQA_README.md){: .btn}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

[Code](https://github.com/Sid2697/HOI-Ref){: .btn}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

[Demo (coming soon)](){: .btn}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

</p>

[comment]: HOIRef
<h3 align="center"><span style="color:DodgerBlue">What is Hand-Object Interaction Referral?</span></h3>
<div style="text-align: justify">


<p>&nbsp;</p>
<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/hoi-ref.png" width="900px" />
		</div>
    <p>&nbsp;</p>
    <figcaption>
    Given an image from an egocentric video, the goal here is to refer the hands and the objects being interacted with. For example, here we wish to refer the left and right hand along with the two objects (jar and lid) that the hands are interacting with.
    </figcaption>
</figure>
</center>

[comment]: VLM4HOI 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<h3 align="center"><span style="color:DodgerBlue">VLM4HOI: VLM for Hand-Object Interaction Referral</span></h3>

<p>&nbsp;</p>
<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/vlm4hoi.png" width="900px" />
		</div>
    <p>&nbsp;</p>
    <figcaption>
    (a) VLM4HOI for hand-object interaction referral in egocentric images. The VLM4HOI model takes in an image (I), passes it through a vision encoder (g) and a projection layer (Wφ) to obtain embeddings (Ep) in language model’s (fθ ) embedding space. This is concatenated with the tokenised text (EL) and passed through fθ to generate a language response (Ea). We show two examples where based on the task instruction template, the model generates an output. (b), the model identifies a bounding box input as the right hand. (c), the model takes in the image and a question to refer the object being held in the right hand and outputs a bounding box.
    </figcaption>
</figure>
</center>
<p>&nbsp;</p>

[comment]: HOIRefTask 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<h3 align="center"><span style="color:DodgerBlue">HOI-Ref Task</span></h3>

<p>&nbsp;</p>
<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/hoi_ref_task.png" width="900px" />
		</div>
    <p>&nbsp;</p>
    <figcaption align="justify">
    HOI-Ref task to train and evaluate VLMs for hand-object interaction referral. HOI-Ref focuses on the following two aspects: ability to spatially refer and recognise hands and objects and the capability to understand hand-object interaction. Columns (1) and (2) evaluate spatially referring hands and objects whereas, columns (3) and (4) aim at object and hand side recognition. Moving across rows (A) and (B) shows HOI-Ref’s ability to evaluate for direct referral vs interaction referral. For example, in A-1, referring a bottle is simply asking where is the bottle however, for B-1, it involves knowing which hand is holding the bottle.
    </figcaption>
</figure>
</center>
<p>&nbsp;</p>

[comment]: hoiqa 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<h3 align="center"><span style="color:DodgerBlue">HOI-QA Dataset</span></h3>

<p>&nbsp;</p>
<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/hoi_qa.png" width="900px" />
		</div>
    <p>&nbsp;</p>
    <figcaption align="justify">
    HOI-QA for training VLMs to understand hand-object interaction. We use multiple annotation types to create the question-answer pairs. Top shows the annotations utilised and Bottom shows the types of question-answer pairs generated from these annotations. As shown, we convert the segments to bounding boxes to generate various referral questions and utilise contact information to understand interaction between hands and objects. Right shows the distribution of questions in the proposed HOI-QA dataset.
    <b>HOI-QA consists of 3.9M question-answer pairs.</b>
    </figcaption>
</figure>
</center>

Details on downloading the dataset can be found on [GitHub](https://github.com/Sid2697/HOI-Ref/blob/main/hoiqa_dataset/HOIQA_README.md).

[comment]: results 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<h3 align="center"><span style="color:DodgerBlue">Qualitative Results</span></h3>

<p>&nbsp;</p>
<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/vlm4hoi_qual.png" width="900px" />
		</div>
    <p>&nbsp;</p>
    <figcaption align="justify">
    Qualitative Results on VLM4HOI and MiniGPT-v2 on HOI-QA. For questions with correct bounding box output, the ground truth bounding box is omitted. When both models are incorrect, we add the ground truth in blue. VLM4HOI performs well on most of the cases where MiniGPT-v2 falls short. VLM4HOI fails in case of ambiguity. For example, it identifies the hand as cloth as the hand is holding the cloth (MiniGPT-v2 predicts waffle).
    </figcaption>
</figure>
</center>

[comment]: Paper
<h3> Paper </h3>

<!-- TODO: Add the links when available -->
- arXiv: [Paper](https://arxiv.org/pdf/2404.09933.pdf); [Abstract](https://arxiv.org/abs/2404.09933)
<!-- - Conference: <b>Coming soon!</b> -->

[comment]: Code and Dataset
<h3> Code and Dataset</h3>
The code for this work is available on GitHub!<br>
Link: [https://github.com/Sid2697/HOI-Ref](https://github.com/Sid2697/HOI-Ref)

The HOI-QA dataset is available on GitHub!<br>
Link: [https://github.com/Sid2697/HOI-Ref/blob/main/hoiqa_dataset/HOIQA_README.md](https://github.com/Sid2697/HOI-Ref/blob/main/hoiqa_dataset/HOIQA_README.md)

<h3> Acknowledgements </h3>

<p style="text-align: justify">
This work uses public datasets---code and models are publicly available. The research is supported by EPSRC UMPIRE EP/T004991/1 and EPSRC Programme Grant VisualAI EP/T028572/1. S Bansal is supported by a Charitable Donation to the University of Bristol from Meta. We acknowledge the use of the EPSRC funded Tier 2 facility JADE-II EP/T022205/1.
The authors would like to thank Alexandros Stergiou, Kranti Kumar Parida, Samuel Pollard, and Rhodri Guerrier for their comments on the manuscript.
</p>

<p>&nbsp;</p>

Please consider citing if you make use of the work:

```
@article{bansal2024hoiref,
  title={HOI-Ref: Hand-Object Interaction Referral in Egocentric Vision},
  author={Bansal, Siddhant and Wray, Michael, and Damen, Dima},
  journal={arXiv preprint arXiv:2404.09933},
  year={2024}
}
```

<p>&nbsp;</p>
<p>&nbsp;</p>
