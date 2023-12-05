---
title: "Siddhant Bansal - UnityGraph"
layout: gridlay
excerpt: "Siddhant Bansal: UnityGraph"
sitemap: false
permalink: /unitygraph/
---

[comment]: Title
<h2 align="center">United We Stand, Divided We Fall:<br>UnityGraph for Unsupervised Procedure Learning from Videos</h2>

[comment]: Authors
<p style="text-align: center;">
<a href="https://sid2697.github.io" style="color: #CC0000"> Siddhant Bansal</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://www.cse.iitd.ac.in/~chetan/" style="color: #CC0000"> Chetan Arora</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://faculty.iiit.ac.in/~jawahar/index.html" style="color: #CC0000"> C.V. Jawahar</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</p>
<p style="text-align: center;"><a href="https://eccv2022.ecva.net/" style="color:#CC0000">WACV 2024</a></p>

<p style="text-align: center;">

[Paper](http://arxiv.org/abs/2311.03550){: .btn}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

[Video](./../docs/wacv24-236.mp4){: .btn}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

[Poster](./../docs/wacv24-236.pdf){: .btn}
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

<h3 align="center"><span style="color:DodgerBlue">Graph-based Procedure Learning (GPL)</span></h3>

We propose the Graph-based Procedure Learning (GPL) framework. Contrary to existing graph-based frameworks, GPL does not require node or edge annotations, enabling unsupervised procedure learning.
<p>&nbsp;</p>
<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/wacv_24_meth_v1-2_2022-08-25.pdf" width="900px" />
		</div>
</figure>
</center>
<p>&nbsp;</p>
<figure style="width: 100%; float: left">
  <p class="caption_justify">
    Graph-based Procedure Learning (GPL) framework. Given multiple videos of the same task, we create UnityGraph.
    Using the Node2Vec algorithm, we exploit the structure of UnityGraph to enhance the node embeddings in an unsupervised manner.
    For example, the temporal and spatial clips that were originally far in the embedding space are closer after Node2Vec (highlighted in blue).
    Finally, we cluster the embeddings using KMeans and filter the background frames to obtain the key-steps required to perform the task.
  </p>
</figure>

</div>
<p>&nbsp;</p>

[comment]: Paper
<h3> Paper </h3>

- PDF: <a href="{{ site.url }}{{ site.baseurl }}/papers/0236.pdf">Paper</a>; <a href="{{ site.url }}{{ site.baseurl }}/papers/0236-supp.pdf">Supplementary</a>
- arXiv: [Paper](https://arxiv.org/pdf/2311.03550); [Abstract](http://arxiv.org/abs/2311.03550)
- WACV: <b>Coming soon!</b>

[comment]: Code
<h3> Code </h3>
Coming Soon!

<h3> Acknowledgements </h3>

<p style="text-align: justify">
The work was supported in part by the Department of Science and Technology, Government of India, under DST/ICPS/Data-Science project ID T-138.
The authors thank <a href="https://makarandtapaswi.github.io">Makarand Tapaswi</a> and <a href="https://sites.google.com/site/charusharmacseiith/">Charu Sharma</a> for their Topics in Deep Learning course which motivated the paper’s central idea.
</p>

<p>&nbsp;</p>

Please consider citing if you make use of the work:

```
@InProceedings{UnityGraphWACV2022,
author="Bansal, Siddhant
and Arora, Chetan
and Jawahar, C.V.",
title="United We Stand, Divided We Fall: UnityGraph for Unsupervised Procedure Learning from Videos",
booktitle = "Winter Conference on Applications of Computer Vision (WACV)",
year="2024"
}
```

<p>&nbsp;</p>
<p>&nbsp;</p>
