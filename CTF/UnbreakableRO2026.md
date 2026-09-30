# CTF Writeups - Unbreakable 2026 prep
## Alternating
The challenge provides a rar archive and the following description:
> “We have hidden something in the file and I'm sure you won't find it. Make sure to extract the archive using WinRar. Windows is your friend.”

I downloaded the archive and unzipped it using WinRar. Inside there is a Flag.txt.txt file that appears to be empty.

The name of the challenge along with the clue for usng WinRar suggest the usage of ADS.

I ran the cmd dir/R in powershell in order to discover alternate data streams:

![CTF](images/ctf-ubr2026-1.png)

And found there is a real_flag.txt stream inside the Flag.txt.txt file. I then used the “more” command to read data from the stream:

![CTF](images/ctf-ubr2026-2.png)

And discovered the flag.

## robots

The challenge provides a service instance and the description “Try Harder!”

When opening the service instance the message “I hope you like robots” appears. So naturally I tried accesing robots.txt
![CTF](images/ctf-ubr2026-3.png)

In robots.txt we identify a disallowed page: 

![CTF](images/ctf-ubr2026-4.png)
Upon accesing that page, the flag is presented:
![CTF](images/ctf-ubr2026-5.png)

## Injector
Once again we are presented with a service instance and the description “Try harder!!”

When accessing the page we see we get a ?host=127.0.0.1 get query in the url
and the text: “command executed ping... “
![CTF](images/ctf-ubr2026-6.png)

So if we add “;ls” after the IP we are able to see the contents of the current
folder, where sure enough a flag.php file is available:

![CTF](images/ctf-ubr2026-7.png)
So instead of ls, we can use cat flag.php in order to read it’s contents:

![CTF](images/ctf-ubr2026-8.png)

Upon inspecting the source of the page we see the flag commented out:
![CTF](images/ctf-ubr2026-9.png)

## BBBBBBBBBB

This challenge presents an archive called chall-zip-in-zip.zip, and the description reads:
> “BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB”

Unzipping the archive reveals a chall.jpg but trying to open it with a photo viewer results in an erorr:

![CTF](images/ctf-ubr2026-10.png)

Running strings shows there are a lot of BBBBBBBBBB characters in the file:

![CTF](images/ctf-ubr2026-11.png)

I used sed to remove the substrings:
![CTF](images/ctf-ubr2026-12.png)

And the image with the flag opens:
![CTF](images/ctf-ubr2026-13.png)

## Random

In this challenge we are presented with a “main” file of type application/octet-stream and a service instance. The challenge description reads “Get the flag, is more easy!!”

After downloading the file we run the Get-Content .\main -Encoding Byte | Format-Hex command to inspect the file and get the following result:
![CTF](images/ctf-ubr2026-14.png)

So we know it is an .elf file. I used ghidra to decompile the file and inside the main function we get this interesting block:
![CTF](images/ctf-ubr2026-15.png)

The function seems to return the flag if the input is 0x539 (1337 decimal). Next let’s connect to the service using netcat:

![CTF](images/ctf-ubr2026-16.png)


## Web intro

For this challenge we are presented with a service and the description: 
> “Are you an admin? Note: Access Denied is part of the challenge. Flag format: CTF{sha256}“

So we access the service via browser and get Access Denied:

![CTF](images/ctf-ubr2026-17.png)

Inspecting the reuqest reveals an interesting cookie:

![CTF](images/ctf-ubr2026-18.png)

If we use base64 to decode the string, we get {logged_in:false}

![CTF](images/ctf-ubr2026-19.png)

Next I used flask_unsign to decode the cookie and brute force the secret:

![CTF](images/ctf-ubr2026-20.png)

I then used flask_usign to sign the cookie with the secret:

![CTF](images/ctf-ubr2026-21.png)

I used the cookie editor firefox plugin and modified the session cookie value:

![CTF](images/ctf-ubr2026-22.png)

And got the flag:

![CTF](images/ctf-ubr2026-23.png)

## SEE

The challenge offers a photo and the description:
> If you can see it, you might just retrieve it! Flag format: CTF{sha256}

In the photo you can see the beginning of the flag:

![CTF](images/ctf-ubr2026-24.png)

First we confirm it is an image 
![CTF](images/ctf-ubr2026-25.png)

We further explore it with exiftool:
![CTF](images/ctf-ubr2026-26.png)


First i tried stegsolve, but the flag is not entirely readable:
![CTF](images/ctf-ubr2026-27.png)

Next i tried imagemagick with no success:
![CTF](images/ctf-ubr2026-28.png)

Next tried enhancing in gimp but without success:
![CTF](images/ctf-ubr2026-29.png)

Next i tried zsteg:

![CTF](images/ctf-ubr2026-30.png)


Channel separation revealed a bit of the flag:

![CTF](images/ctf-ubr2026-31.png)

On channel 0 (red) we can start to see the details in the flag:
![CTF](images/ctf-ubr2026-32.png)

Next with normalize i managed to enhance even more:

![CTF](images/ctf-ubr2026-33.png)
and with some trial and error we get the flag.

##Phpwn:
> Free note taking app! Automatic backups every minute included in free tier!

Source code:

![CTF](images/ctf-ubr2026-34.png)

In the interface we provide an UUID that follows the convention

![CTF](images/ctf-ubr2026-35.png)

We reach the final point where an error is displayed:
![CTF](images/ctf-ubr2026-36.png)

Accessing /private/backup.sh reveals the following:
![CTF](images/ctf-ubr2026-37.png)

So we must provide a payload that copies /tmp/flag in var/www/html/flag.txt, wait a minute and should be able to retrieve it. However, add slashes modifies the payload:

![CTF](images/ctf-ubr2026-38.png)

We try with backticks

![CTF](images/ctf-ubr2026-39.png)

Change user id and try with ${IFS}

![CTF](images/ctf-ubr2026-40.png)

Try in base64 `echo Y3AgL3RtcC9mbGFnLnR4dCAvdmFyL3d3dy9odG1sL2ZsYWcudHh0|base64 -d|bash`

Check the formatting is correct in backup.sh

![CTF](images/ctf-ubr2026-41.png)

And after a minute, we get the flag:
![CTF](images/ctf-ubr2026-42.png)






