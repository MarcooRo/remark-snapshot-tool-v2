# remark-snapshot-tool-v2
Easy way to make a snapshot of Remark 1.0 &amp; 2.0
The tool that takes the latest Singular consolidation dump 1.0 and 2.0 and, associating whit a search key, extracts all the addresses and info that contain the NFT kay

# Installation
Needs: <a href='https://nodejs.org/it/' target='_blank'>node +16v</a> and <a href='https://www.npmjs.com/' target='_blank'>npm +6</a></br>
Run <code>npm i</code> and <code>node main.js</code>

# How to use
Open <code>localhost:4000</code><br>
If you want to set a limit time you can add a block number or leave it empty to take the actual situation<br>
Choose if you want use Remark 1.0 or Remark 2.0<br>
Add Collection ID or a key<br>
Make Snap!

# What does it do
After you push the botton the script download the latest Singular consolidation dump, we use the lite vertion.<br>
The Excel file contains this information extracted from the dump: NFT-ID, address, block, timestamp.<br>
The file download will start automatically.<br>
For the consolidation dump look <a href='https://docs.rmrk.app/syncing#consolidation' target='_blank'>here</a>
For all Remark specs look <a href='https://github.com/rmrk-team/rmrk-spec' target='_blank'>here</a>

# What we could do in the future
We would like to improve this tools, we plan to do these things in the near future:
<ul>
    <li>
        This tools is for creators, so we plan to move everything to a public domain, so that you don't need to have technical knowledge to use it
    </li>
    <li>
        Add the possibility of taking a backdated snapshot, for example by creating an automation that downloads and keeps in memory the last 7 days of the dump
    </li>
</ul>
If you have any requests, write us!
